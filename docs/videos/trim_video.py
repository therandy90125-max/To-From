"""
Video Trimming Script for QuantaFolio Navigator
Trims and optimizes video tutorials for web embedding

Requirements:
    pip install moviepy

Usage:
    python trim_video.py
"""

from moviepy.editor import VideoFileClip
import os

def trim_video(input_file, output_file, duration=20, height=480, bitrate="600k"):
    """
    Trim and optimize video for web embedding
    
    Args:
        input_file: Input video file path
        output_file: Output video file path
        duration: Duration in seconds (default: 20)
        height: Video height in pixels (default: 480)
        bitrate: Output bitrate (default: 600k)
    """
    if not os.path.exists(input_file):
        print(f"❌ Error: Input file '{input_file}' not found!")
        print(f"   Please place your video file in: {os.getcwd()}")
        return False
    
    try:
        print(f"📹 Processing video: {input_file}")
        print(f"   Duration: {duration}s | Height: {height}px | Bitrate: {bitrate}")
        
        # Load, trim, and resize the video
        clip = VideoFileClip(input_file).subclip(0, duration).resize(height=height)
        
        # Write output file
        clip.write_videofile(
            output_file,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            bitrate=bitrate
        )
        
        # Clean up
        clip.close()
        
        print(f"✅ Success! Saved as: {output_file}")
        print(f"   Original: {os.path.getsize(input_file) / 1024 / 1024:.2f} MB")
        print(f"   Trimmed:  {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing video: {str(e)}")
        return False

if __name__ == "__main__":
    # Configuration
    INPUT_VIDEO = "The_Q-Equity_Workflow.mp4"
    OUTPUT_VIDEO = "The_Q-Equity_Workflow_20s.mp4"
    
    print("=" * 60)
    print("  QuantaFolio Navigator - Video Trimming Tool")
    print("=" * 60)
    print()
    
    # Check if input file exists
    if not os.path.exists(INPUT_VIDEO):
        print(f"⚠️  Input file not found: {INPUT_VIDEO}")
        print()
        print("Please:")
        print("  1. Generate video with NotebookLM")
        print("  2. Save as: The_Q-Equity_Workflow.mp4")
        print(f"  3. Place in: {os.getcwd()}")
        print("  4. Run this script again")
        print()
    else:
        # Process video
        success = trim_video(INPUT_VIDEO, OUTPUT_VIDEO)
        
        if success:
            print()
            print("🎬 Next steps:")
            print(f"  1. Review: {OUTPUT_VIDEO}")
            print("  2. Move to: frontend/public/videos/")
            print("  3. Embed in About page or Dashboard")
            print()
    
    print("=" * 60)

