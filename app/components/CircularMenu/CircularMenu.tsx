import React, { useEffect } from "react";
import { useCategory } from "../../context/CategoryContext";
import { useNavigate } from "@tanstack/react-router";
import { validateAccessToken } from "../../routes/api/auth";

// Define the types for our data structure
interface Segment {
  name: string;
  color: string;
  icon: string;
}

interface Section {
  title: string;
  startAngle: number;
  endAngle: number;
  background: string;
  segments: Segment[];
}

export function CircularMenu() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const navigate = useNavigate();

  // Add state for current user
  const [currentUser, setCurrentUser] = React.useState<{
    primaryResource?: string[];
  } | null>(null);

  // Add effect to get user's primary resource on mount
  useEffect(() => {
    const getUserPrimaryResource = async () => {
      try {
        const result = await validateAccessToken();
        if (result.success && result.user) {
          setCurrentUser(result.user);
          // Set initial selected category to user's primary resource
          if (result.user.primaryResource?.[0]) {
            setSelectedCategory(result.user.primaryResource[0]);
          }
        }
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };

    getUserPrimaryResource();
  }, []); // Empty dependency array means this runs once on mount

  // Define the sections and their segments
  const sections: Section[] = [
    {
      title: "PROJECT & CONSTRUCTION RESOURCES",
      startAngle: 180,
      endAngle: 360,
      background: "#aed581",
      segments: [
        { name: "Land", color: "#F44336", icon: "🗺" },
        { name: "Machines", color: "#0D47A1", icon: "🏗" },
        { name: "Material", color: "#29B6F6", icon: "🛠" },
        { name: "Equipment", color: "#29B6F6", icon: "⚙️" },
        { name: "Tools", color: "#29B6F6", icon: "🔧" },
        { name: "Manpower", color: "#29B6F6", icon: "👥" },
      ],
    },
    {
      title: "BUSINESS RESOURCES",
      startAngle: 0,
      endAngle: 120,
      background: "#ffd180",
      segments: [
        { name: "Finance", color: "#9C27B0", icon: "💰" },
        { name: "Tenders", color: "#FFC107", icon: "📋" },
        { name: "Showcase", color: "#FF9800", icon: "🎯" },
        { name: "Auction", color: "#4CAF50", icon: "🔨" },
      ],
    },
    {
      title: "STUDENT RESOURCES",
      startAngle: 120,
      endAngle: 180,
      background: "#64b5f6",
      segments: [
        { name: "Jobs", color: "#009688", icon: "💼" },
        { name: "E-Stores", color: "#009688", icon: "🛍" },
      ],
    },
  ];

  const handleSegmentClick = (segmentName: string) => {
    setSelectedCategory(segmentName);
    // Dispatch custom event for DealRoom
    const event = new CustomEvent("categorySelected", {
      detail: { category: segmentName },
    });
    window.dispatchEvent(event);

    // Only navigate for project and construction categories
    const projectCategories = [
      "Land",
      "Machines",
      "Material",
      "Equipment",
      "Tools",
      "Manpower",
    ];
    if (projectCategories.includes(segmentName)) {
      navigate({
        to: "/projectandconstruction",
        search: { category: segmentName },
      });
    } else {
      // For other categories, just show a message or handle differently
      console.log(`Category ${segmentName} is coming soon!`);
    }
  };

  return (
    <div className="scale-[0.5] min-[375px]:scale-[0.6] md:scale-[0.6] lg:scale-[0.7] 2xl:scale-100">
      <div className="circle-menu">
        {/* Outer ring with colored backgrounds and titles */}
        <div className="outer-ring">
          {sections.map((section, index) => {
            const startRad = (section.startAngle * Math.PI) / 180;
            const endRad = (section.endAngle * Math.PI) / 180;
            const innerRadius = 240;
            const outerRadius = 280;

            // Create the background arc path
            const arcPath = `M ${300 + innerRadius * Math.cos(startRad)} ${300 + innerRadius * Math.sin(startRad)}
                L ${300 + outerRadius * Math.cos(startRad)} ${300 + outerRadius * Math.sin(startRad)}
                A ${outerRadius} ${outerRadius} 0 0 1 ${300 + outerRadius * Math.cos(endRad)} ${300 + outerRadius * Math.sin(endRad)}
                L ${300 + innerRadius * Math.cos(endRad)} ${300 + innerRadius * Math.sin(endRad)}
                A ${innerRadius} ${innerRadius} 0 0 0 ${300 + innerRadius * Math.cos(startRad)} ${300 + innerRadius * Math.sin(startRad)}`;

            // Text path - fix for upside down text
            // Adjust text radius based on section to add spacing
            let textRadius = 260;
            if (section.startAngle >= 0 && section.startAngle < 180) {
              // Add more spacing for BUSINESS RESOURCES and STUDENT RESOURCES
              textRadius = 268;
            }

            const pathId = `textPath-${index}`;

            // Determine if we need to reverse the path for readability
            // For sections that would appear upside down, we create a reversed path
            const needsReversedPath =
              section.startAngle >= 0 && section.startAngle < 180;

            let textPath;
            if (needsReversedPath) {
              // Create path from end to start for better text orientation
              textPath = `M ${300 + textRadius * Math.cos(endRad)} ${300 + textRadius * Math.sin(endRad)} 
                         A ${textRadius} ${textRadius} 0 0 0 
                         ${300 + textRadius * Math.cos(startRad)} ${300 + textRadius * Math.sin(startRad)}`;
            } else {
              // Normal path from start to end
              textPath = `M ${300 + textRadius * Math.cos(startRad)} ${300 + textRadius * Math.sin(startRad)} 
                         A ${textRadius} ${textRadius} 0 0 1 
                         ${300 + textRadius * Math.cos(endRad)} ${300 + textRadius * Math.sin(endRad)}`;
            }

            return (
              <div key={`title-${index}`} className="section-title">
                <svg
                  width="600"
                  height="600"
                  style={{ position: "absolute", left: 0, top: 0 }}
                >
                  {/* Colored background arc */}
                  <path
                    d={arcPath}
                    fill={section.background}
                    className="title-background"
                  />
                  <defs>
                    <path id={pathId} d={textPath} fill="none" />
                  </defs>
                  <text className="curved-text">
                    <textPath
                      href={`#${pathId}`}
                      startOffset="50%"
                      textAnchor="middle"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "1.2px",
                        fill: "#333",
                      }}
                    >
                      {section.title}
                    </textPath>
                  </text>
                </svg>
              </div>
            );
          })}
        </div>

        {/* Segments/Buttons */}
        <div className="segments">
          {sections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`} className="section">
              {section.segments.map((segment, i) => {
                const segmentAngle =
                  (section.endAngle - section.startAngle) /
                  section.segments.length;
                const startAngle = section.startAngle + i * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const midAngle = (startAngle + endAngle) / 2;

                const gapSize = 0.5;
                const adjustedStartAngle = startAngle + gapSize;
                const adjustedEndAngle = endAngle - gapSize;

                const labelRadius = 180; // Adjusted for new size
                const labelX =
                  295 + labelRadius * Math.cos((midAngle * Math.PI) / 180);
                const labelY =
                  295 + labelRadius * Math.sin((midAngle * Math.PI) / 180);

                let textRotation = 0;

                if (
                  segment.name === "Land" ||
                  segment.name === "Machines" ||
                  segment.name === "Material" ||
                  segment.name === "Auction" ||
                  segment.name === "Jobs" ||
                  segment.name === "E-Stores"
                ) {
                  textRotation = 0;
                } else {
                  if (midAngle >= 180 && midAngle <= 360) {
                    textRotation = midAngle <= 270 ? 180 : 0;
                  } else {
                    textRotation = midAngle <= 90 ? 0 : 180;
                  }
                }

                const isSelected =
                  selectedCategory === segment.name ||
                  (currentUser?.primaryResource?.[0] === segment.name &&
                    !selectedCategory);

                return (
                  <button
                    key={`segment-${sectionIndex}-${i}`}
                    className={`segment-button ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSegmentClick(segment.name)}
                    style={{
                      background: segment.color,
                      clipPath: `path('M 295 295 L ${
                        295 +
                        245 * Math.cos((adjustedStartAngle * Math.PI) / 180)
                      } ${
                        295 +
                        245 * Math.sin((adjustedStartAngle * Math.PI) / 180)
                      } A 245 245 0 0 1 ${
                        295 + 245 * Math.cos((adjustedEndAngle * Math.PI) / 180)
                      } ${
                        295 + 245 * Math.sin((adjustedEndAngle * Math.PI) / 180)
                      } Z')`,
                    }}
                  >
                    <div
                      className="segment-content"
                      style={{
                        position: "absolute",
                        left: `${labelX}px`,
                        top: `${labelY}px`,
                        transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="segment-icon">{segment.icon}</span>
                      <span className="segment-name">{segment.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Center circle */}
        <div className="center-circle">
          <img
            src="/upcr-logo.png"
            alt="UPC Resources Logo"
            className="center-logo"
          />
        </div>
      </div>

      <style>{`
        .circle-menu {
          position: relative;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: transparent;
          margin: 0 auto;
        }

        .outer-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }

        .section-title {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .curved-text {
          fill: #333;
          text-transform: uppercase;
        }

        .segments {
          position: absolute;
          width: 540px;
          height: 540px;
          top: 46%;
          left: 46%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 3; /* Ensure segments are above the outer ring */
        }

        .section {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .segment-button {
          position: absolute;
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          margin: 0;
          outline: none;
          transform-origin: center;
          pointer-events: auto;
          z-index: 3;
        }

        .segment-button:hover {
          filter: brightness(1.2);
          transform: scale(1.05);
          z-index: 4;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .segment-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: inherit;
        }

        .segment-button:hover .segment-content {
          transform: scale(1.1);
        }

        .segment-icon {
          font-size: 24px;
          color: white;
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }

        .segment-name {
          color: white;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .segment-button:hover .segment-icon {
          transform: scale(1.2);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .segment-button:hover .segment-name {
          font-weight: 600;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
        }

        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 5;
          padding: 12px;
        }

        .center-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .title-background {
          filter: brightness(0.98);
        }

        .segment-button.selected {
          filter: brightness(1.2);
          transform: scale(1.05);
          z-index: 4;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .segment-button.selected .segment-content {
          transform: scale(1.1);
        }

        .segment-button.selected .segment-icon {
          transform: scale(1.2);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .segment-button.selected .segment-name {
          font-weight: 600;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
