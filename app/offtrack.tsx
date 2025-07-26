import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

export default function OfftrackScreen() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [playingTrack, setPlayingTrack] = useState<any | null>(null);
  const soundRef = useRef(new Audio.Sound());

  const pickTrack = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
    if (result.canceled) return;
    const file = result.assets[0];

    setTracks((prev) => [...prev, file]);
    if (soundRef.current) await soundRef.current.unloadAsync();

    const { sound } = await Audio.Sound.createAsync({ uri: file.uri });
    soundRef.current = sound;
    await sound.playAsync();
    setPlayingTrack(file);
  };

  const togglePlayback = async () => {
    const status = await soundRef.current.getStatusAsync();

    if ("isPlaying" in status) {
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } else {
      console.warn("Audio player is not in a valid state:", status);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Offtrack</Text>

      <View style={styles.vinylContainer}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/2/26/Blank_album_cover_white.png",
          }}
          style={styles.coverImage}
        />
        <View style={styles.record} />
      </View>

      <Text style={styles.trackText}>
        {playingTrack ? playingTrack.name : "No track playing"}
      </Text>

      <View style={styles.controls}>
        <Button title="📂 Load Track" onPress={pickTrack} />
        <Button title="⏯ Play/Pause" onPress={togglePlayback} />
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={async () => {
              if (soundRef.current) await soundRef.current.unloadAsync();
              const { sound } = await Audio.Sound.createAsync({
                uri: item.uri,
              });
              soundRef.current = sound;
              await sound.playAsync();
              setPlayingTrack(item);
            }}
          >
            <Text style={styles.trackItem}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  vinylContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  record: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#000",
    position: "absolute",
    zIndex: 1,
  },
  coverImage: {
    width: 180,
    height: 180,
    backgroundColor: "#fff",
    borderWidth: 1,
    zIndex: 2,
  },
  trackText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
    color: "#333",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  trackItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
