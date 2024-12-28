import fs from "fs";

interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: number;
  endDate: number;
  description: string;
  associatedSkills: string[];
  duration: number;
  ongoing: boolean;
}

interface ProfessionalExperience {
  companyName: string;
  title: string;
  location: string;
  type: string;
  startDate: number;
  endDate: number;
  description: string;
  associatedSkills: string[];
  duration: number;
  ongoing: boolean;
}

interface Certification {
  title: string;
  issuer?: string;
  issueDate?: number;
}

interface CvData {
  lastName: string;
  firstName: string;
  address: string;
  professionalSummary: string;
  jobTitle: string;
  promotionYear: number;
  professionalExperiences: ProfessionalExperience[];
  educations: Education[];
  hardSkills: string[];
  softSkills: string[];
  publications: string[];
  distinctions: string[];
  certifications: Certification[];
  references: string[];
}

interface Metadata {
  CHUNK_TEXT: string;
  REF: number;
  NAME: string;
  USERID: number;
}

/**
 * Compiles CV data into formatted chunks.
 *
 * @param {CvData} data - The CV data.
 * @returns {Array<string>} The formatted chunks.
 */
function compileToChunk(data: CvData): string[] {
  const {
    lastName,
    firstName,
    address,
    professionalSummary,
    jobTitle,
    promotionYear,
    professionalExperiences,
    educations,
    hardSkills,
    softSkills,
    publications,
    distinctions,
    certifications,
    references,
  } = data;

  const chunks: string[] = [];
  const fullname = `${firstName} ${lastName}`;

  /**
   * Adds a formatted chunk of text to the chunks array.
   *
   * @param {string} title - The title of the chunk.
   * @param {string} content - The content of the chunk.
   */
  const addChunk = (title: string, content: string) => {
    chunks.push(`${title.toUpperCase()} of ${fullname}\r${content}`);
  };

  addChunk(
    "information",
    `
title: ${jobTitle}
professionalSummary: I had started my professional career since ${promotionYear}. ${professionalSummary}
address: ${address || "Prefer Not To Say"}
`
  );

  educations.forEach((education) => {
    addChunk(
      "education",
      `
degree: ${education.degree}
institution: ${education.institution}
location: ${education.location}
startDate: ${new Date(education.startDate).toLocaleDateString()}
endDate: ${new Date(education.endDate).toLocaleDateString()}
description: ${education.description}
associatedSkills: ${education.associatedSkills.join(", ")}
duration: ${education.duration} months
${education.ongoing ? "ongoing: true" : ""}
`
    );
  });

  professionalExperiences.forEach((experience) => {
    addChunk(
      "professional experience",
      `
companyName: ${experience.companyName}
title: ${experience.title}
location: ${experience.location}
type: ${experience.type}
startDate: ${new Date(experience.startDate).toLocaleDateString()}
endDate: ${
        experience.ongoing
          ? "Present"
          : new Date(experience.endDate).toLocaleDateString()
      }
description: ${experience.description}
duration: ${experience.duration} months
${
  experience.associatedSkills.length
    ? `associatedSkills: ${experience.associatedSkills.join(", ")}`
    : ""
}
`
    );
  });

  if (hardSkills.length) {
    addChunk("hard skills", hardSkills.join(", "));
  }

  if (softSkills.length) {
    addChunk("soft skills", softSkills.join(", "));
  }

  if (distinctions.length) {
    addChunk("distinctions", distinctions.join("\n"));
  }

  if (publications.length) {
    addChunk("publications", publications.join("\n"));
  }

  if (references.length) {
    addChunk("references", references.join("\n"));
  }

  if (certifications.length) {
    let array: string[] = [];
    certifications.forEach(({ title, issuer, issueDate }) => {
      array.push(
        `title: ${title}\n${issuer ? `issuer: ${issuer}` : ""}\n${
          issueDate
            ? `issuerDate: ${new Date(issueDate).toLocaleDateString()}`
            : ""
        }`
      );
    });
    addChunk("certification", array.join("\n"));
  }

  return chunks;
}

const data: CvData[] = require("./compileCV.json");
let result: Metadata[] = [];

data.forEach((dataCV, i) => {
  let chunks = compileToChunk(dataCV);
  let metadata = chunks.map((chunk, index) => {
    return {
      CHUNK_TEXT: chunk.trim(),
      REF: index + 1,
      NAME: `${dataCV.firstName} ${dataCV.lastName}`,
      USERID: i + 1,
    };
  });
  result = result.concat(metadata);
});

fs.writeFileSync("metadata.json", JSON.stringify(result, null, 2));
