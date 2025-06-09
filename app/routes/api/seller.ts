import { createServerFn } from "@tanstack/react-start";
import { z, ZodIssue } from "zod";
import { db } from "../../db"; // Import Drizzle db instance
import { sellers } from "../../db/schema"; // Import sellers schema
import { eq } from "drizzle-orm";
import { validateAccessToken } from "./auth"; // To get the authenticated user
import { supabase } from "../../lib/supabase"; // Import supabase instance
import { portfolios } from "../../db/schema"; // Import portfolios schema
import { gigs } from "../../db/schema"; // Import gigs schema

// Explicit type for the Seller object based on your schema/usage
type Seller = {
  id: number;
  user_id: string; // Ensure this matches the actual type in your db/auth logic
  company_name: string;
  business_type: string;
  address: string;
  phone: string;
  website?: string | null;
  description?: string | null;
  profile_picture_url?: string | null;
  aadhar_url?: string | null;
  gst_certificate_url?: string | null;
  work_photos_urls?: string[] | null;
  owner_photos_urls?: string[] | null;
  skills?: string[];
  languages?: string[];
  portfolio_urls?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

// Schema for seller onboarding data validation
const sellerOnboardingSchema = z.object({
  userId: z.string(), // Expecting user ID to be passed
  company_name: z.string().min(1, "Company name is required"),
  business_type: z.string().min(1, "Business type is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  aadhar_url: z.string().url().nullable().optional(),
  gst_certificate_url: z.string().url().nullable().optional(),
  work_photos_urls: z.array(z.string().url()).nullable().optional(),
  owner_photos_urls: z.array(z.string().url()).nullable().optional(),
});

type SellerOnboardingData = z.infer<typeof sellerOnboardingSchema>;

// Define possible success/error response types
type CreateSellerResponse =
  | { success: true; seller: Seller }
  | { success: false; error: string };

export const createSellerProfile = createServerFn({
  method: "POST",
  response: "data",
})
  .validator((data: unknown): SellerOnboardingData => {
    return sellerOnboardingSchema.parse(data);
  })
  .handler(async ({ data }): Promise<CreateSellerResponse> => {
    try {
      // Validate user token again on the server for security
      const authResult = await validateAccessToken();

      // --- DIAGNOSTIC LOGGING ---

      // --- END LOGGING ---

      if (
        !authResult.success ||
        !authResult.user ||
        authResult.user.id !== data.userId
      ) {
        console.error(
          "[createSellerProfile] Auth check failed: Result success=",
          authResult.success,
          "User exists=",
          !!authResult.user,
          "IDs match=",
          authResult.user?.id === data.userId
        );
        return {
          success: false,
          error: "Unauthorized or user mismatch",
        };
      }

      // Convert userId string from auth to number for database query if necessary
      // IMPORTANT: Check if your `sellers.user_id` is integer or text/varchar matching authResult.user.id
      const userIdAsNumber = parseInt(data.userId, 10);
      if (isNaN(userIdAsNumber)) {
        return { success: false, error: "Invalid user ID format." };
      }

      // Check if user already has a seller profile (using Drizzle)
      const existingSeller = await db.query.sellers.findFirst({
        where: eq(sellers.user_id, userIdAsNumber), // Use the numeric ID
        columns: { id: true }, // Only need to check for existence
      });

      if (existingSeller) {
        return {
          success: false,
          error: "User already has a seller profile",
        };
      }

      // Create new seller profile (using Drizzle)
      const [newSellerData] = await db
        .insert(sellers)
        .values({
          user_id: userIdAsNumber, // Use the numeric ID
          company_name: data.company_name,
          business_type: data.business_type,
          address: data.address,
          phone: data.phone,
          website: data.website || null,
          description: data.description || null,
          aadhar_url: data.aadhar_url || null,
          gst_certificate_url: data.gst_certificate_url || null,
          work_photos_urls: data.work_photos_urls || null,
          owner_photos_urls: data.owner_photos_urls || null,
          // is_verified defaults to false in schema
          // created_at/updated_at likely have defaults in schema
        })
        .returning(); // Get the newly created record

      if (!newSellerData) {
        return {
          success: false,
          error: "Failed to create seller profile, no data returned.",
        };
      }

      // IMPORTANT: Adapt the returned data to match the Seller type if needed
      // Drizzle might return different field names or types (e.g., Date objects)
      // This cast might be too simplistic depending on the exact return type
      const newSeller = {
        ...newSellerData,
        user_id: String(newSellerData.user_id), // Convert back to string if needed by Seller type
        created_at: newSellerData.created_at.toISOString(), // Example: Convert Date to string
        updated_at: newSellerData.updated_at.toISOString(), // Example: Convert Date to string
      } as Seller;

      return {
        success: true,
        seller: newSeller,
      };
    } catch (error) {
      console.error("Error in createSellerProfile handler:", error);
      if (error instanceof z.ZodError) {
        const firstIssue = error.errors[0]?.message || "Invalid data";
        return {
          success: false,
          error: `Validation failed: ${firstIssue}`,
        };
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      return {
        success: false,
        error: errorMessage,
      };
    }
  });

// --- Server function to check seller status ---
type GetSellerStatusResponse =
  | { success: true; isSeller: true; seller: Seller }
  | { success: true; isSeller: false; seller: null }
  | { success: false; error: string };

export const getSellerStatus = createServerFn({
  method: "POST", // Or GET, POST is common for actions/queries via createServerFn
  response: "data",
})
  .validator((data: { userId: string }) => {
    // Validate that userId is provided
    return z.object({ userId: z.string() }).parse(data);
  })
  .handler(async ({ data }): Promise<GetSellerStatusResponse> => {
    try {
      // Optional: Validate user token again for added security
      // const authResult = await validateAccessToken();
      // if (!authResult.success || !authResult.user || authResult.user.id !== data.userId) {
      //   return { success: false, error: 'Unauthorized' };
      // }

      const userIdAsNumber = parseInt(data.userId, 10);
      if (isNaN(userIdAsNumber)) {
        return { success: false, error: "Invalid user ID format." };
      }

      // Find seller profile using Drizzle
      const foundSeller = await db.query.sellers.findFirst({
        where: eq(sellers.user_id, userIdAsNumber),
        // Select all columns needed for the Seller type
      });

      if (foundSeller) {
        // Adapt data if necessary (e.g., dates to strings)
        const sellerData = {
          ...foundSeller,
          user_id: String(foundSeller.user_id),
          created_at: foundSeller.created_at.toISOString(),
          updated_at: foundSeller.updated_at.toISOString(),
        } as Seller;
        return { success: true, isSeller: true, seller: sellerData };
      } else {
        return { success: true, isSeller: false, seller: null };
      }
    } catch (error) {
      console.error("[getSellerStatus] Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch seller status.";
      return { success: false, error: errorMessage };
    }
  });

// --- Server function to get seller by ID ---
type GetSellerByIdResponse =
  | { success: true; seller: Seller }
  | { success: false; error: string };

export const getSellerById = createServerFn({
  method: "POST",
  response: "data",
})
  .validator((data: { sellerId: number }) => {
    return z.object({ sellerId: z.number() }).parse(data);
  })
  .handler(async ({ data }): Promise<GetSellerByIdResponse> => {
    try {
      const foundSeller = await db.query.sellers.findFirst({
        where: eq(sellers.id, data.sellerId),
      });

      if (!foundSeller) {
        return { success: false, error: "Seller not found" };
      }

      const sellerData = {
        ...foundSeller,
        user_id: String(foundSeller.user_id),
        created_at: foundSeller.created_at.toISOString(),
        updated_at: foundSeller.updated_at.toISOString(),
      } as Seller;

      return { success: true, seller: sellerData };
    } catch (error) {
      console.error("[getSellerById] Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch seller.";
      return { success: false, error: errorMessage };
    }
  });

export const updateSellerProfile = createServerFn({
  method: "POST",
  response: "data",
})
  .validator((data: unknown) => {
    return z
      .object({
        sellerId: z.number(),
        company_name: z.string().min(1),
        business_type: z.string().min(1),
        address: z.string().min(1),
        phone: z.string().min(1),
        website: z.string().url().nullable().optional(),
        description: z.string().nullable().optional(),
        profile_picture_url: z.string().url().nullable().optional(),
        aadhar_url: z.string().url().nullable().optional(),
        gst_certificate_url: z.string().url().nullable().optional(),
        work_photos_urls: z.array(z.string().url()).nullable().optional(),
        owner_photos_urls: z.array(z.string().url()).nullable().optional(),
      })
      .parse(data);
  })
  .handler(async ({ data }) => {
    try {
      // Validate user token for security
      const authResult = await validateAccessToken();
      if (!authResult.success || !authResult.user) {
        return { success: false, error: "Unauthorized" };
      }

      // Ensure arrays are properly handled
      const workPhotosUrls = Array.isArray(data.work_photos_urls)
        ? data.work_photos_urls.filter(
            (url): url is string => url !== null && url !== undefined
          )
        : null;

      const ownerPhotosUrls = Array.isArray(data.owner_photos_urls)
        ? data.owner_photos_urls.filter(
            (url): url is string => url !== null && url !== undefined
          )
        : null;

      // Update seller profile using Drizzle
      const [updatedSeller] = await db
        .update(sellers)
        .set({
          company_name: data.company_name,
          business_type: data.business_type,
          address: data.address,
          phone: data.phone,
          website: data.website || null,
          description: data.description || null,
          profile_picture_url: data.profile_picture_url || null,
          aadhar_url: data.aadhar_url || null,
          gst_certificate_url: data.gst_certificate_url || null,
          work_photos_urls: workPhotosUrls,
          owner_photos_urls: ownerPhotosUrls,
          updated_at: new Date(),
        })
        .where(eq(sellers.id, data.sellerId))
        .returning();

      if (!updatedSeller) {
        console.error("Seller not found for ID:", data.sellerId);
        return { success: false, error: "Seller not found" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating seller profile:", error);
      return { success: false, error: "Failed to update seller profile" };
    }
  });

export const getSellerPortfolio = createServerFn({
  method: "POST",
  response: "data",
})
  .validator((data: { sellerId: number }) => {
    return z.object({ sellerId: z.number() }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      const items = await db
        .select()
        .from(portfolios)
        .where(eq(portfolios.seller_id, data.sellerId));

      // Ensure each item has the required fields
      const formattedItems = items.map((item) => ({
        image_url: item.image_url,
        title: item.title,
        description: item.description,
      }));

      return { success: true, portfolio: formattedItems };
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      return { success: false, error: "Failed to fetch portfolio items" };
    }
  });

export const getSellerGigs = createServerFn({
  method: "POST",
  response: "data",
})
  .validator((data: { sellerId: number }) => {
    return z.object({ sellerId: z.number() }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      const items = await db
        .select()
        .from(gigs)
        .where(eq(gigs.seller_id, data.sellerId));
      return { success: true, gigs: items };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch gigs",
      };
    }
  });
