# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# 🔐 MESSU BOUW - ProGuard Security Rules
# Ochrona przed reverse engineering i kradzieżą kodu

# === PODSTAWOWE ZABEZPIECZENIA ===
-dontskipnonpubliclibraryclasses
-verbose
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontpreverify

# Obfuskacja - ukryj nazwy klas i metod
-repackageclasses ''
-allowaccessmodification
-optimizations !code/simplification/arithmetic

# === CAPACITOR FRAMEWORK ===
-keep class com.getcapacitor.** { *; }
-keep class capacitor.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin *;
}

# === WEBVIEW & JAVASCRIPT ===
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# === GOOGLE SERVICES (Firebase, Maps) ===
-keep class com.google.** { *; }
-dontwarn com.google.**

# === ANDROID COMPONENTS ===
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# === ANDROIDX & SUPPORT LIBS ===
-keep class androidx.** { *; }
-dontwarn androidx.**

# === KOTLIN (jeśli używasz) ===
-keep class kotlin.** { *; }
-dontwarn kotlin.**

# === DEBUG INFO (usuń w release) ===
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# === 🔒 OCHRONA LICENCJI - NIE USUWAJ ===
# Ukryj klasy związane z systemem licencji
-keep class com.messubouw.license.** { *; }

# Usuń wszystkie logi z produkcji
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# === CRASH REPORTING (jeśli używasz) ===
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exception

