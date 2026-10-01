# Mistakes to avoid (non-negotiable)

Each rule comes from a real edit that went wrong.

1. **Washed-out colours.** iPhone footage is HDR (HLG/BT.2020/Dolby Vision). Decoding it as normal video makes it grey/white. Always tonemap to BT.709 (build_base.py does it when probe says hdr) and render tagged BT.709. Compare a still with the original before delivering.
2. **Do not "fix" colours nobody asked to fix.** No global grading, no saturation boosts. Natural colour of the original shot, always.
3. **Cards covering the face.** Cards go at the top, ≤ 2 lines; if the face is high in frame, shorten or skip the card. Check every card on a still.
4. **Ugly cover frame.** Never pick the cover frame alone. Show 4–6 candidates where the person smiles at camera and let them choose. A cut-out of the person on brand background with elements around works better than a raw frame with text on top.
5. **Missing content.** If the structure says "6 points" but 4 are filmed, or an answer sits under the wrong question, stop and ask: send the clip, or cut the video shorter. Never ship contradictions.
6. **Burned-in captions/overlays** from a videomaker cannot be removed. Ask for the clean export first.
7. **Different audio levels between clips.** Every segment is loudness-matched (build_base.py) and the voice is normalised to -15 LUFS. Listen to the cut points.
8. **Silence and dead time.** Cut every pause > 0.3 s, false starts, fillers, and any part the user asked to drop (e.g. flipping book pages before speaking).
9. **Generic look.** Captions alone are not an edit. Add section panels, cards, punch-ins, explainer scenes, SFX and music without being asked.
10. **Wrong voice.** On-screen text follows brand.json voice (noi/io, tu/lei), even when the speaker says it differently.
11. **Invented facts.** No invented numbers, results, testimonials, client names. Use what the user said or confirmed.
12. **Copyrighted music** downloaded from social networks: never. Synthesized original bed, or a licensed file from the user.
13. **Inspiration links (TikTok/Instagram) can't be opened** from the sandbox. Say so, and ask for a screen recording or a description of what they like.
14. **Files > 30 MB** fail to upload in chat: re-encode before delivering.
15. **Safe zones.** Nothing important in the top 110 px, bottom 320 px, right 120 px.
16. **Blocked downloads.** HuggingFace / Chrome downloads are often blocked: use the GitHub sources in setup.sh and the local Chromium.
17. **Memory limits.** Big segmentation models (birefnet) crash small machines: use isnet-general-use.
18. **Every correction becomes a rule.** When the user corrects something, apply it everywhere in the current video and note it for the next ones.
