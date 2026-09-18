# Question model

An item is not UI text. The canonical representation separates: semantic `task`, parameter/generation provenance, weighted `skills`, `presentation` and interaction contract, expected/accepted response, `scoring`, and difficulty features. A generated arithmetic item can therefore be replayed from its seed and presented by a different accessible renderer without changing educational logic.

Responses are raw typed values; scorers return an explicit result. An attempt saves both response and expected response snapshot, plus question JSON and scorer version, so later scorer/mastery work does not rewrite history. Initial renderer: `arithmetic-equation` + `numeric-input`. Future renderers must declare accessible prompt, keyboard strategy, and an alternative to drag-only interaction.

This borrows QTI's useful separation but is deliberately not QTI XML or an interoperability claim.
