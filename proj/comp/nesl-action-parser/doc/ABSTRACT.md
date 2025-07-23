# NESL Action Parser

Parses NESL blocks from LLM responses into validated loaf action objects, executing as many valid actions as possible while collecting errors for failed blocks.

## Overview

This component bridges between LLM-generated NESL syntax and loaf's action system. It processes text containing NESL blocks, validates each block independently against loaf's action schema, and transforms valid blocks into executable action objects. The parser is intentionally permissive - it processes all blocks and collects both successes and failures, allowing loaf to execute valid actions while reporting specific errors back to the LLM for correction. This design minimizes expensive LLM regeneration by salvaging partial success from responses containing some malformed blocks.

The parser handles:
- NESL syntax parsing via nesl-js
- Action type validation against unified-design schema  
- Parameter presence and type checking
- String-to-type conversions (booleans, integers, paths)
- Comprehensive error collection with block context
- Preservation of NESL metadata (IDs, line numbers)

This approach enables efficient LLM-loaf interaction by providing detailed feedback on exactly which actions failed and why, allowing targeted corrections rather than full regeneration.