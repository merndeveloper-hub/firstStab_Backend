import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename); // Fixed: double underscore

const serviceAccountPath = join(dirName, "serviceKey.json");

let firebaseInitialized = false;

try {
  if (!firebaseInitialized && admin.apps.length === 0) {
    console.log("📁 Reading service account file from:", serviceAccountPath);
    
    // Read and verify the file exists
    // if (!fs.existsSync(serviceAccountPath)) {
    //   throw new Error(`Service account file not found at: ${serviceAccountPath}`);
    // }
    
    const rawFile = readFileSync(serviceAccountPath, "utf8");
    console.log("✅ File read successfully, length:", rawFile.length);
    
    const serviceAccount = JSON.parse(rawFile);
    console.log("✅ JSON parsed, project ID:", serviceAccount.project_id);
    console.log("📧 Client email:", serviceAccount.client_email);
    
    // Verify private key format (first and last line)
    const pk = serviceAccount.private_key;
    console.log("🔑 Private key starts with:", pk.substring(0, 50));
    console.log("🔑 Private key ends with:", pk.substring(pk.length - 50));
    
    // Initialize with error handling
    console.log("🔄 Initializing Firebase Admin SDK...");
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
    console.log("📦 Project ID:", serviceAccount.project_id);
    
    // Test authentication immediately
    console.log("🧪 Testing authentication...");
    try {
      const auth = admin.auth();
      const user = await auth.getUser("dummy"); // Will fail but test auth
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log("✅ Authentication test passed (expected user-not-found error)");
      } else {
        console.log("⚠️ Authentication test result:", authError.code, authError.message);
      }
    }
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:");
  console.error("   Error name:", error.name);
  console.error("   Error message:", error.message);
  console.error("   Error code:", error.code);
  console.error("   Full error:", error);
  throw error;
}

export default admin;