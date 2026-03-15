import SwiftUI

struct VoiceInputView: View {
    @EnvironmentObject private var voice: VoiceService
    @Environment(\.dismiss) private var dismiss

    let onCommit: ([PopTask]) async -> Void

    @State private var hasPermission = false
    @State private var isProcessing = false
    @State private var committedTranscript = ""
    @State private var pulseScale: CGFloat = 1.0

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle
            RoundedRectangle(cornerRadius: 3)
                .fill(Color(.systemFill))
                .frame(width: 36, height: 5)
                .padding(.top, 12)
                .padding(.bottom, 24)

            // Status label
            Text(statusText)
                .font(.title3.weight(.semibold))
                .foregroundStyle(voice.isListening ? .blue : .primary)
                .animation(.easeInOut, value: voice.isListening)
                .padding(.bottom, 16)

            // Live transcript
            if !displayTranscript.isEmpty {
                Text(displayTranscript)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.bottom, 24)
                    .animation(.easeInOut, value: displayTranscript)
            } else {
                Spacer().frame(height: 24)
            }

            // Mic button
            ZStack {
                if voice.isListening {
                    Circle()
                        .stroke(Color.red.opacity(0.3), lineWidth: 3)
                        .frame(width: 100, height: 100)
                        .scaleEffect(pulseScale)
                        .opacity(2 - pulseScale)
                }

                Button(action: toggleListening) {
                    Circle()
                        .fill(voice.isListening ? Color.red : Color.blue)
                        .frame(width: 80, height: 80)
                        .overlay(
                            Image(systemName: voice.isListening ? "stop.fill" : "mic.fill")
                                .font(.system(size: 30, weight: .medium))
                                .foregroundStyle(.white)
                        )
                        .shadow(color: (voice.isListening ? Color.red : .blue).opacity(0.35), radius: 10, y: 4)
                }
                .disabled(isProcessing)
            }
            .frame(height: 120)

            if let error = voice.error {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.top, 8)
            }

            Spacer()

            // Confirm button — shown after recording stops
            if !voice.isListening && !committedTranscript.isEmpty && !isProcessing {
                Button {
                    Task { await commitTasks() }
                } label: {
                    Text("Add Tasks")
                        .font(.system(size: 17, weight: .semibold))
                        .frame(maxWidth: .infinity, minHeight: 54)
                        .background(Color.blue)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            } else {
                Spacer().frame(height: 86)
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.hidden)
        .task {
            hasPermission = await voice.requestPermissions()
            if !hasPermission {
                voice.error = "Microphone access required. Enable it in Settings > Privacy > Microphone."
            }
        }
        .onChange(of: voice.isListening) { _, listening in
            if listening {
                withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
                    pulseScale = 1.4
                }
            } else {
                withAnimation { pulseScale = 1.0 }
            }
        }
        .onDisappear {
            if voice.isListening { voice.stopListening() }
        }
    }

    // MARK: - Computed

    private var statusText: String {
        if isProcessing    { return "Adding tasks..." }
        if voice.isListening { return "Listening..." }
        if !committedTranscript.isEmpty { return "Ready to add" }
        return "Tap to speak"
    }

    private var displayTranscript: String {
        voice.isListening ? voice.transcript : committedTranscript
    }

    // MARK: - Actions

    private func toggleListening() {
        if voice.isListening {
            committedTranscript = voice.transcript
            voice.stopListening()
        } else {
            guard hasPermission else {
                voice.error = "Please enable microphone access in Settings."
                return
            }
            committedTranscript = ""
            voice.startListening()
        }
    }

    private func commitTasks() async {
        guard !committedTranscript.isEmpty else { return }
        isProcessing = true
        let classified = await ClassifierService.shared.classify(transcript: committedTranscript)
        await onCommit(classified)
        isProcessing = false
        dismiss()
    }
}
