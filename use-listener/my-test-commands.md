📋 Copied to clipboard

=== LOAF RESULTS ===
=== END ===

📋 Copied to clipboard

=== LOAF RESULTS ===
=== END ===

📋 Copied to clipboard

=== LOAF RESULTS ===
h1 ✅ file_replace_lines /Users/stuart/repos/loaf/use-listener/test-files/ham.md
h2 ✅ file_replace_lines /Users/stuart/repos/loaf/use-listener/test-files/ham.md
h3 ✅ file_replace_lines /Users/stuart/repos/loaf/use-listener/test-files/ham.md
h4 ✅ file_replace_lines /Users/stuart/repos/loaf/use-listener/test-files/ham.md
=== END ===

I'll analyze the ham.md file and create NESL actions to replace each question with expanded dialog. Looking at the file, I can identify these questions:

1. Line 8: "Who's there?"
2. Line 25: "Have you had quiet guard?"
3. Line 33: "I think I hear them. Stand, ho! Who's there?"
4. Line 44: "Who hath relieved you?"

Here are the NESL actions to replace each question with expanded dialog:

```sh nesl
#!NESL [@three-char-SHA-256: h1]
action = "file_replace_lines"
path = "/Users/stuart/repos/loaf/use-listener/test-files/ham.md"
lines = "8"
new_content = <<'EOT_NESL_h1'
Who's there? Speak, I charge thee!
Is it friend or foe that walks these ramparts
In this bitter cold and darksome hour?
EOT_NESL_h1
#!END_NESL_h1
```

```sh nesl
#!NESL [@three-char-SHA-256: h2]
action = "file_replace_lines"
path = "/Users/stuart/repos/loaf/use-listener/test-files/ham.md"
lines = "25"
new_content = <<'EOT_NESL_h2'
Have you had quiet guard? No stirrings
In the night, no shadows moving where
They ought not be, no whispers on the wind?
EOT_NESL_h2
#!END_NESL_h2
```

```sh nesl
#!NESL [@three-char-SHA-256: h3]
action = "file_replace_lines"
path = "/Users/stuart/repos/loaf/use-listener/test-files/ham.md"
lines = "33"
new_content = <<'EOT_NESL_h3'
I think I hear them. Stand, ho! Who's there?
Declare yourselves before you take another step,
For I'll not let unknown figures pass unchallenged!
EOT_NESL_h3
#!END_NESL_h3
```

```sh nesl
#!NESL [@three-char-SHA-256: h4]
action = "file_replace_lines"
path = "/Users/stuart/repos/loaf/use-listener/test-files/ham.md"
lines = "44"
new_content = <<'EOT_NESL_h4'
Who hath relieved you? Tell me true,
Which soldier takes your place upon this watch,
That I may know all's well before I go?
EOT_NESL_h4
#!END_NESL_h4
```

Note: These expansions maintain the interrogative nature while adding context about the guards' concerns (security, cold, duty transitions) that fit the scene's atmosphere.