import json

log_path = "/Users/apple/.gemini/antigravity-ide/brain/150e054c-57a4-4737-9bd1-8a1afc0ae840/.system_generated/logs/transcript.jsonl"

try:
    user_inputs = []
    assistant_replies = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            step_idx = obj.get("step_index", 0)
            # We want to find steps before the current turn
            if step_idx < 3927:
                source = obj.get("source")
                typ = obj.get("type")
                if typ == "USER_INPUT":
                    user_inputs.append((step_idx, obj.get("content", "")))
                elif typ == "PLANNER_RESPONSE" and source == "MODEL":
                    assistant_replies.append((step_idx, obj.get("content", "")))
                    
    print(f"Total USER inputs before 3927: {len(user_inputs)}")
    print(f"Total MODEL replies before 3927: {len(assistant_replies)}")
    
    print("\n--- LAST 3 USER INPUTS BEFORE 3927 ---")
    for step_idx, content in user_inputs[-3:]:
        print(f"Step {step_idx}:")
        print(content[:600])
        print("-" * 50)
        
    print("\n--- LAST 3 MODEL REPLIES BEFORE 3927 ---")
    for step_idx, content in assistant_replies[-3:]:
        print(f"Step {step_idx}:")
        print(content[:600])
        print("-" * 50)
except Exception as e:
    print("Error:", e)
