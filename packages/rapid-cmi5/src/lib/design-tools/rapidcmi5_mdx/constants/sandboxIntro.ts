export const sandboxIntro = `
# 🚀 Rapid CMI5

**Rapid CMI5** is a streamlined authoring and deployment tool for building, validating, and launching CMI5-compliant eLearning courses. Built for speed, flexibility, and modern development workflows, Rapid CMI5 enables both developers and instructional designers to create high-quality CMI5 packages without the complexity of traditional tools.

---

## ✨ Key Features

- ✅ **Rapid Authoring Workflow** – Build CMI5 courses using simple, readable Markdown
- 📦 **One-Click Packaging** – Instantly generate a fully spec-compliant CMI5 zip, either from the UI or as part of a CI/CD pipeline
- 🔧 **Validation & Preview** – Catch structural issues early and preview your course locally before deployment
- 🔄 **Git-Friendly & Provider-Agnostic** – All course files are plain text and easily versioned with any Git provider: GitHub, GitLab, Bitbucket, etc.

---

## 🧪 Getting Started (Sandbox Mode)

You are currently in a **sandbox course** — perfect for learning, exploring, and testing features.

> ⚠️ **Note:** This sandbox should not be used for building production-ready courses.

### 📁 About the Sandbox

- By default, the sandbox is **not connected to a remote Git repository**.
- In standard workflows, you would:
  1. Create a remote Git repository (e.g. on GitHub or GitLab)
  2. Clone that repository using Rapid CMI5
  3. Begin authoring and versioning your course files

### 🔗 Connecting to a Remote Repository

To connect the sandbox to a remote repository:
- Click **"Attach Remote Repo"** from the Git menu  
- Or click the **gear icon** in the Git menu to configure Git settings

Both options will walk you through connecting your local course to a remote repo.

---

## 🎯 Testing in an LMS

To test this course in a CMI5-compatible LMS:
1. Click the **"Download Course"** button
2. Upload the generated \`.zip\` file into the LMS of your choice

That’s it — you're ready to launch and track your course using the CMI5 standard.

---

Happy authoring! 🎉
`;
