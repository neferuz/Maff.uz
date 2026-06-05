import json

log_path = "/Users/apple/.gemini/antigravity-ide/brain/150e054c-57a4-4737-9bd1-8a1afc0ae840/.system_generated/logs/transcript.jsonl"

try:
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            if obj.get("type") == "USER_INPUT":
                content = obj.get("content", "")
                if "silkwood" in content.lower() or "силквуд" in content.lower() or "kronofloor" in content.lower():
                    print(f"Step {obj.get('step_index')}:")
                    print(content)
                    print("=" * 60)
except Exception as e:
    print("Error:", e)
