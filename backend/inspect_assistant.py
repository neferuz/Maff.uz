import json

log_path = "/Users/apple/.gemini/antigravity-ide/brain/150e054c-57a4-4737-9bd1-8a1afc0ae840/.system_generated/logs/transcript.jsonl"

try:
    with open(log_path, "r", encoding="utf-8") as f:
        # We can read all lines and show the last few steps
        lines = f.readlines()
        print(f"Total lines in transcript: {len(lines)}")
        for idx in range(max(0, len(lines)-10), len(lines)):
            obj = json.loads(lines[idx])
            print(f"Step {obj.get('step_index')} | Source {obj.get('source')} | Type {obj.get('type')}:")
            content = obj.get("content", "")
            if len(content) > 500:
                print(content[:500] + "\n... [TRUNCATED]")
            else:
                print(content)
            print("=" * 60)
except Exception as e:
    print("Error:", e)
