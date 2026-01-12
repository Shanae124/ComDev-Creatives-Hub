const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const extract = require("extract-zip");
const xml2js = require("xml2js");

/**
 * BrightspaceMigrator - Converts Brightspace course exports (.imscc) to ProtexxaLearn format
 * .imscc files are ZIP archives containing course structure and content in IMS format
 */
class BrightspaceMigrator {
  constructor(imsccFilePath) {
    this.imsccFilePath = imsccFilePath;
    this.extractedDir = path.join(__dirname, `temp_${Date.now()}`);
    this.courseData = {
      title: "",
      description: "",
      modules: [],
      lessons: [],
      assignments: [],
    };
  }

  /**
   * Parse the .imscc file (ZIP archive) and extract course data
   */
  async parseIMSCC() {
    console.log("📦 Extracting .imscc file...");

    try {
      // Extract ZIP
      await extract(this.imsccFilePath, { dir: this.extractedDir });

      // Read manifest.xml to understand structure
      const manifestPath = path.join(
        this.extractedDir,
        "imsmanifest.xml"
      );
      const manifestXML = fs.readFileSync(manifestPath, "utf-8");

      // Parse XML structure with xml2js
      await this.parseManifest(manifestXML);

      console.log("✅ .imscc parsed successfully");
      return this.courseData;
    } catch (error) {
      console.error("❌ Error parsing IMSCC:", error.message);
      throw error;
    }
  }

  /**
   * Parse manifest.xml using xml2js
   */
  async parseManifest(manifestXML) {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(manifestXML);

      // Extract course title from manifest
      if (result.manifest?.metadata?.schema) {
        this.courseData.title = result.manifest.metadata?.title || "Imported Course";
      } else {
        this.courseData.title = "Imported Course";
      }

      // Parse organizations (modules)
      if (result.manifest?.organizations?.organization) {
        const org = result.manifest.organizations.organization;
        const items = Array.isArray(org.item) ? org.item : org.item ? [org.item] : [];

        items.forEach((item, idx) => {
          this.courseData.modules.push({
            id: item.$.id || `module_${idx}`,
            title: item.title || `Module ${idx + 1}`,
            lessons: [],
          });
        });
      }

      console.log(`📚 Found ${this.courseData.modules.length} modules`);
    } catch (error) {
      console.warn("⚠️ XML parsing failed, using fallback regex:", error.message);
      this.parseManifestFallback(manifestXML);
    }
  }

  /**
   * Fallback regex-based parser if xml2js fails
   */
  parseManifestFallback(manifestXML) {
    const titleMatch = manifestXML.match(/<title>(.*?)<\/title>/);
    this.courseData.title = titleMatch ? titleMatch[1] : "Imported Course";

    const itemMatches = [...manifestXML.matchAll(/<item[^>]*id="([^"]*)"[^>]*>\s*<title>(.*?)<\/title>/g)];
    itemMatches.forEach((match) => {
      const [, itemId, itemTitle] = match;
      this.courseData.modules.push({
        id: itemId,
        title: itemTitle,
        lessons: [],
      });
    });

    console.log(`📚 Found ${this.courseData.modules.length} modules`);
  }

  /**
   * Read HTML content files from extracted directory
   */
  readContentFiles() {
    const filesDir = path.join(this.extractedDir, "web_resources");

    if (!fs.existsSync(filesDir)) {
      console.log("ℹ️ No web_resources directory found");
      return;
    }

    const files = fs.readdirSync(filesDir);
    console.log(`📄 Found ${files.length} content files`);

    files.forEach((file) => {
      if (file.endsWith(".html")) {
        const content = fs.readFileSync(path.join(filesDir, file), "utf-8");
        // Map files to lessons
        this.courseData.lessons.push({
          title: file.replace(/\.html$/, ""),
          content_html: content,
          lesson_type: "reading",
        });
      }
    });
  }

  /**
   * Convert parsed data to ProtexxaLearn API format
   */
  toProtexxaFormat() {
    return {
      course: {
        title: this.courseData.title,
        description: this.courseData.description || "Imported from Brightspace",
        content_html: "<p>Course imported from Brightspace</p>",
      },
      modules: this.courseData.modules.map((mod) => ({
        title: mod.title,
        description: "",
        sort_order: this.courseData.modules.indexOf(mod) + 1,
      })),
      lessons: this.courseData.lessons.map((lesson) => ({
        title: lesson.title,
        content_html: lesson.content_html,
        lesson_type: lesson.lesson_type,
        duration_minutes: 30,
      })),
      assignments: this.courseData.assignments,
    };
  }

  /**
   * Clean up extracted files
   */
  cleanup() {
    if (fs.existsSync(this.extractedDir)) {
      fs.rmSync(this.extractedDir, { recursive: true, force: true });
      console.log("🧹 Temporary files cleaned up");
    }
  }

  /**
   * Main migration process
   */
  async migrate() {
    try {
      await this.parseIMSCC();
      this.readContentFiles();
      const result = this.toProtexxaFormat();
      this.cleanup();

      console.log("✅ Migration completed successfully!");
      console.log(`
📊 Migration Summary:
   - Course: ${result.course.title}
   - Modules: ${result.modules.length}
   - Lessons: ${result.lessons.length}
   - Assignments: ${result.assignments.length}
      `);

      return result;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }
}

/**
 * Usage example:
 * const migrator = new BrightspaceMigrator('./course.imscc');
 * const result = await migrator.migrate();
 * // result contains: { course, modules, lessons, assignments }
 */

module.exports = BrightspaceMigrator;

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: node brightspaceMigrator.js <path-to-imscc-file>");
    process.exit(1);
  }

  const migrator = new BrightspaceMigrator(filePath);
  migrator.migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
