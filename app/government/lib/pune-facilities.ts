/** Primary reporting anchor per analytics locality (PMC + PCMC belt, demo routing). */
export const PUNE_WARD_PRIMARY_FACILITY: Record<string, { id: string; name: string }> = {
  Kothrud: { id: "sahyadri-karve", name: "Sahyadri Hospital (Karve Rd)" },
  Shivajinagar: { id: "sassoon", name: "Sassoon General / B.J. Medical" },
  Hadapsar: { id: "sanjeevani-hadapsar", name: "Sanjeevani Hospital (Hadapsar)" },
  Deccan: { id: "deccan-gymkhana-phc", name: "Deccan Gymkhana urban PHC hub" },
  "Viman Nagar": { id: "sahyadri-nagar", name: "Sahyadri Hospital (Nagar Rd)" },
  "Koregaon Park": { id: "ruby-hall", name: "Ruby Hall Clinic" },
  Aundh: { id: "jupiter-baner", name: "Jupiter Hospital (Baner belt)" },
  Wakad: { id: "columbia-wakad", name: "Columbia Asia (Wakad)" },
  "Pune metropolitan fringe": { id: "pmc-integrated", name: "PMC integrated fever clinic network" },
}

export const PUNE_REPORTING_SITES = [
  { id: "all", name: "All reporting sites" },
  { id: "sassoon", name: "Sassoon General / B.J. Medical" },
  { id: "ruby-hall", name: "Ruby Hall Clinic" },
  { id: "sahyadri-karve", name: "Sahyadri Hospital (Karve Rd)" },
  { id: "sanjeevani-hadapsar", name: "Sanjeevani Hospital (Hadapsar)" },
  { id: "sahyadri-nagar", name: "Sahyadri Hospital (Nagar Rd)" },
  { id: "jupiter-baner", name: "Jupiter Hospital (Baner belt)" },
  { id: "columbia-wakad", name: "Columbia Asia (Wakad)" },
  { id: "deccan-gymkhana-phc", name: "Deccan Gymkhana PHC hub" },
  { id: "pmc-integrated", name: "PMC integrated fever clinic network" },
] as const
