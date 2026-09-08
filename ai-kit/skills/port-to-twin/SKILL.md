---
name: port-to-twin
description: Carry a change into the twin application and report what cannot be carried. Run by /unity-ai:port.
---

# Port to the twin

`frontera` and `king-front` are the same application twice: about nine of ten component
directories exist in both. The surroundings are not the same, and that is what breaks ports —
different default branches, turbo in only one of them, a guides directory whose name is spelled
differently, and a shared-library pin that is not always equal.

So this is never a cherry-pick. It is: find out what is portable, port that, and say plainly what
was left behind.

## Steps

1. Establish the facts, from the source repository:

   ```shell
   node scripts/ai.mjs port-map --commit <sha or range>
   ```

   It prints the structural differences and a verdict per file: `identical`, `differs`,
   `missing-in-twin`, `deleted-here`. Path renames between the twins are resolved.

2. Show the user that verdict, grouped, **before** any work. A port they did not agree to the
   shape of is a port they will revert.

3. Delegate to the `port-to-twin` agent, passing the verdict, the twin's path, and the instruction
   to read `<toolkit>/skills/port-to-twin/references/playbook.md` first. The procedure lives there
   so the main context does not pay for it.

4. Return the agent's three lists — ported, adapted, not ported — verbatim. The last one matters
   most.

Inputs to have before step 3: which commit or range, and which twin. Everything else the agent
derives. It cannot ask.
