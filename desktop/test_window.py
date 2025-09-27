import tkinter as tk
from tkinter import messagebox, scrolledtext
import requests
import threading
import time
import sys
import subprocess

BASE_URL = "http://localhost:5000/api"

class TestApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Coding Test Platform")
        self.test_data = None
        self.duration = 60  # default
        self.remaining_time = 0
        self.timer_running = False

        # Initial form
        self.build_login_form()

    def build_login_form(self):
        self.clear_window()

        tk.Label(self.root, text="Enter Name:").grid(row=0, column=0, padx=10, pady=10)
        self.name_entry = tk.Entry(self.root, width=30)
        self.name_entry.grid(row=0, column=1, padx=10, pady=10)

        tk.Label(self.root, text="Enter Test Code:").grid(row=1, column=0, padx=10, pady=10)
        self.code_entry = tk.Entry(self.root, width=30)
        self.code_entry.grid(row=1, column=1, padx=10, pady=10)

        tk.Button(self.root, text="Start Test", command=self.fetch_test).grid(row=2, column=0, columnspan=2, pady=20)

    def fetch_test(self):
        name = self.name_entry.get().strip()
        code = self.code_entry.get().strip()

        if not name or not code:
            messagebox.showerror("Error", "Name and Test Code are required")
            return

        try:
            res = requests.get(f"{BASE_URL}/tests/code/{code}")
            if res.status_code != 200:
                messagebox.showerror("Error", res.json().get("message", "Failed to fetch test"))
                return
            self.test_data = res.json()
            self.test_data["userName"] = name
            self.duration = self.test_data.get("durationMinutes", 60)
            self.remaining_time = self.duration * 60
            self.build_test_window()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to fetch test: {e}")

    def build_test_window(self):
        self.clear_window()

        # Timer
        self.timer_label = tk.Label(self.root, text="", font=("Arial", 14), fg="red")
        self.timer_label.pack(pady=5)

        # Title
        tk.Label(self.root, text=self.test_data["title"], font=("Arial", 16, "bold")).pack(pady=5)

        # Layout frames
        frame = tk.Frame(self.root)
        frame.pack(fill="both", expand=True)

        # Problem statement
        problem_frame = tk.Frame(frame)
        problem_frame.pack(side="left", fill="y", padx=10, pady=10)
        tk.Label(problem_frame, text="Problem Statement", font=("Arial", 12, "bold")).pack()
        self.problem_text = scrolledtext.ScrolledText(problem_frame, wrap="word", width=40, height=20)
        self.problem_text.pack()
        self.problem_text.insert("1.0", self.test_data["problemStatement"])
        self.problem_text.configure(state="disabled")

        # Code editor
        editor_frame = tk.Frame(frame)
        editor_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        tk.Label(editor_frame, text="Python Code Editor", font=("Arial", 12, "bold")).pack()
        self.code_editor = scrolledtext.ScrolledText(editor_frame, wrap="none", width=80, height=20)
        self.code_editor.pack()

        # Output
        tk.Label(editor_frame, text="Output", font=("Arial", 12, "bold")).pack(pady=(10,0))
        self.output_text = scrolledtext.ScrolledText(editor_frame, wrap="word", width=80, height=8, state="disabled")
        self.output_text.pack()

        # Buttons
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=10)
        tk.Button(button_frame, text="Run", command=self.run_code).pack(side="left", padx=10)
        tk.Button(button_frame, text="Submit", command=self.submit_test).pack(side="left", padx=10)

        # Start timer
        self.timer_running = True
        threading.Thread(target=self.update_timer, daemon=True).start()

    def run_code(self):
        code = self.code_editor.get("1.0", "end-1c")
        if not code.strip():
            messagebox.showerror("Error", "No code entered")
            return

        try:
            # Save to temp file
            with open("temp_code.py", "w") as f:
                f.write(code)

            # Run python code in subprocess
            result = subprocess.run([sys.executable, "temp_code.py"], capture_output=True, text=True, timeout=5)

            self.output_text.configure(state="normal")
            self.output_text.delete("1.0", "end")
            if result.stdout:
                self.output_text.insert("1.0", result.stdout)
            if result.stderr:
                self.output_text.insert("end", "\nErrors:\n" + result.stderr)
            self.output_text.configure(state="disabled")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to run code: {e}")

    def submit_test(self):
        code = self.code_editor.get("1.0", "end-1c")
        payload = {
            "testCode": self.test_data["testCode"],
            "userName": self.test_data["userName"],
            "code": code,
            "pasteCount": 0,
            "multiFaceCount": 0
        }

        try:
            res = requests.post(f"{BASE_URL}/submissions/", json=payload)
            if res.status_code == 201:
                self.show_thanks_window()
            else:
                messagebox.showerror("Error", res.json().get("message", "Submission failed"))
        except Exception as e:
            messagebox.showerror("Error", f"Submission failed: {e}")

    def show_thanks_window(self):
        self.clear_window()
        tk.Label(self.root, text="Thanks for taking the test!", font=("Arial", 16)).pack(pady=20)
        tk.Button(self.root, text="Close", command=self.root.destroy).pack(pady=10)

    def update_timer(self):
        while self.remaining_time > 0 and self.timer_running:
            mins, secs = divmod(self.remaining_time, 60)
            self.timer_label.config(text=f"Time Remaining: {mins:02d}:{secs:02d}")
            time.sleep(1)
            self.remaining_time -= 1
        if self.remaining_time <= 0 and self.timer_running:
            self.submit_test()

    def clear_window(self):
        for widget in self.root.winfo_children():
            widget.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = TestApp(root)
    root.mainloop()
