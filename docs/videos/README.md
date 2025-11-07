# 📹 Video Tutorials for QuantaFolio Navigator

## Overview

This folder contains video tutorials explaining the Q-Equity optimization workflow and other features of QuantaFolio Navigator.

---

## 🎬 Video List

### 1. The Q-Equity Workflow (20s)

**File:** `The_Q-Equity_Workflow_20s.mp4`  
**Duration:** 20 seconds  
**Resolution:** 480p  
**Size:** ~600KB (optimized for web)

**Content:**
- Introduction to Q-Equity workflow
- Step-by-step optimization process
- Visual demonstration of quantum algorithms

**Generated with:** NotebookLM

---

## 🛠️ How to Generate Videos

### Using NotebookLM:

1. **Create a new notebook** in NotebookLM
2. **Topic:** "Q-Equity Workflow - Quantum Portfolio Optimization"
3. **Content to include:**
   ```
   - What is Q-Equity?
   - How quantum optimization works
   - QAOA algorithm explanation
   - Portfolio weight optimization
   - Risk vs Return tradeoff
   - Real-world application examples
   ```
4. **Generate video:**
   - Click "Generate Video"
   - Select duration: 20 seconds
   - Select format: MP4
   - Download as: `The_Q-Equity_Workflow.mp4`

### Video Specs:
```
Format: MP4
Codec: H.264
Resolution: 1920x1080 (original)
Audio: AAC
```

---

## ⚙️ Video Processing

### Requirements:

```bash
pip install moviepy
```

### Processing Script:

Use the provided `trim_video.py` script to:
- Trim video to 20 seconds
- Resize to 480p (web-optimized)
- Reduce bitrate to 600k
- Compress for faster loading

### Usage:

```bash
# 1. Place your video in this folder
cp ~/Downloads/The_Q-Equity_Workflow.mp4 .

# 2. Run trimming script
python trim_video.py

# 3. Output will be: The_Q-Equity_Workflow_20s.mp4
```

### Manual Processing (moviepy):

```python
from moviepy.editor import VideoFileClip

# Load, trim, and resize
clip = VideoFileClip("The_Q-Equity_Workflow.mp4").subclip(0, 20).resize(height=480)

# Export optimized version
clip.write_videofile(
    "The_Q-Equity_Workflow_20s.mp4",
    codec="libx264",
    audio_codec="aac",
    preset="ultrafast",
    bitrate="600k"
)

clip.close()
```

---

## 🌐 Embedding Videos

### In React Components:

```jsx
// Dashboard.jsx or About.jsx
<div className="video-tutorial">
  <h3>📹 How It Works</h3>
  <video 
    controls 
    width="100%" 
    style={{ maxWidth: '640px', borderRadius: '8px' }}
  >
    <source src="/videos/The_Q-Equity_Workflow_20s.mp4" type="video/mp4" />
    Your browser does not support video playback.
  </video>
  <p className="video-caption">
    Learn about the Q-Equity optimization workflow
  </p>
</div>
```

### Video Placement:

```
frontend/
  └─ public/
      └─ videos/
          └─ The_Q-Equity_Workflow_20s.mp4
```

Then access via: `http://localhost:5173/videos/The_Q-Equity_Workflow_20s.mp4`

---

## 📊 Video Optimization Settings

| Setting | Original | Optimized | Reason |
|---------|----------|-----------|--------|
| Duration | Variable | 20s | Attention span |
| Resolution | 1080p | 480p | Web performance |
| Bitrate | ~3000k | 600k | File size |
| File Size | ~5-10 MB | ~600 KB | Loading speed |
| Format | MP4 | MP4 | Compatibility |

---

## 🎨 Video Style Guide

### Content Guidelines:

1. **Keep it short** - Max 20-30 seconds
2. **Clear audio** - Use text overlays if needed
3. **Visual demonstrations** - Show, don't just tell
4. **Quantum visuals** - Use quantum circuit diagrams
5. **Brand colors** - Match QuantaFolio theme (cyan + dark blue)

### Recommended Topics:

- [ ] Q-Equity Workflow (20s) ✅
- [ ] Stock Search Tutorial (15s)
- [ ] Portfolio Optimization Demo (30s)
- [ ] QAOA Algorithm Explanation (25s)
- [ ] Risk-Return Tradeoff (20s)
- [ ] Dashboard Tour (30s)

---

## 🚀 Next Steps

### For Users:

1. ✅ Generate video with NotebookLM
2. ✅ Process with `trim_video.py`
3. Move to `frontend/public/videos/`
4. Embed in About page or Dashboard
5. Test playback

### For Developers:

1. Create video component
2. Add lazy loading
3. Add play/pause controls
4. Add fullscreen option
5. Track video analytics

---

## 📝 Video Checklist

Before adding video to production:

- [ ] Video duration ≤ 30 seconds
- [ ] File size ≤ 1 MB
- [ ] Resolution: 480p or 720p
- [ ] Format: MP4 (H.264)
- [ ] Audio: Clear and audible
- [ ] Subtitles: Added (optional)
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] Loading spinner added
- [ ] Error handling implemented

---

## 🆘 Troubleshooting

### "Module 'moviepy' not found"

```bash
pip install moviepy
# or
pip install moviepy[optional]
```

### "FFmpeg not found"

```bash
# Windows
choco install ffmpeg

# Mac
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

### Video won't play in browser

- Check file path
- Verify MP4/H.264 codec
- Test in different browsers
- Check console for errors
- Ensure file is in `public/` folder

---

## 📚 Resources

**NotebookLM:** https://notebooklm.google.com/  
**moviepy docs:** https://zulko.github.io/moviepy/  
**FFmpeg:** https://ffmpeg.org/  
**Web Video Best Practices:** https://web.dev/video/

---

**Last Updated:** November 7, 2025  
**Status:** Ready for video generation  
**Next:** Generate Q-Equity Workflow video with NotebookLM

