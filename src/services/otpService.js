import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase.js";

let confirmationResult = null;
let recaptchaVerifier = null;

export const setupRecaptcha = (elementId) => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: () => console.log("Recaptcha verified"),
    "expired-callback": () => console.log("Recaptcha expired"),
  });

  return recaptchaVerifier;
};

export const sendFirebaseOTP = async (phone) => {
  try {
    const phoneNumber = `+91${phone}`;

    if (!recaptchaVerifier) {
      throw new Error("Recaptcha not initialized");
    }

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return { success: true };
  } catch (error) {
    console.error("Firebase OTP error:", error.message);

    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    if (error.code === "auth/invalid-phone-number") {
      return { success: false, message: "Invalid phone number" };
    }
    if (error.code === "auth/too-many-requests") {
      return { success: false, message: "Too many attempts. Try later." };
    }
    if (error.code === "auth/quota-exceeded") {
      return { success: false, message: "SMS quota exceeded." };
    }

    return { success: false, message: error.message };
  }
};

export const verifyFirebaseOTP = async (otp) => {
  try {
    if (!confirmationResult) {
      return { valid: false, message: "Please request OTP first." };
    }

    await confirmationResult.confirm(otp);
    return { valid: true };
  } catch (error) {
    console.error("OTP verify error:", error.message);

    if (error.code === "auth/invalid-verification-code") {
      return { valid: false, message: "Incorrect OTP. Try again." };
    }
    if (error.code === "auth/code-expired") {
      return { valid: false, message: "OTP expired. Request a new one." };
    }

    return { valid: false, message: "Verification failed. Try again." };
  }
};
