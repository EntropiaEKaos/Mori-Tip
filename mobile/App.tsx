import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

const MORI_PWA_URL = "https://mori.app"; // Change to actual production URL

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: MORI_PWA_URL }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        startInLoadingState
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
