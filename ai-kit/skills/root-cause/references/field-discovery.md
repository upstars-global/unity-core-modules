# Finding the Root cause field

The field is a custom select. Its id is different in every Jira project, and the option list is
edited by people who do not tell us. So both are read at runtime, every time.

1. Read the issue with its fields. The field's **name** is stable ("Root cause"); its key is a
   `customfield_*` id that is not.
2. Read the issue type's edit metadata for the project. The field appears there with its
   `allowedValues` — that list is the only valid vocabulary for the write.
3. If the field is absent from the edit metadata, it is not on this issue type's screen. Stop and
   offer a comment instead; writing anyway produces a 200 with no effect.
4. Never invent an option, never map to "Other" because nothing fit. If nothing fits, say which
   options existed and why none apply, and let the user choose.

The same caution applies to the write itself: after setting the field, read it back. A silent drop
looks exactly like success.
