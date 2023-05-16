- [x] ability to have a vscode-like interface for project search
- [x] clone repo and collect latest commit of each day
- [x] we might want to count files that match a grep and not search in them at all
  - [x] we might want to count LOC of files that match glob and not just those files
- vis
  - table where dates are columns and rows are search tools
- [ ] another API to get from vs code would be their find references
- [ ] better to have fewer cli flags and more configs from json (for example repo)
  - [ ] should be able to specify local dir not just remote
  - [ ] should you be able to look at multiple repos and roll them all back?
- [ ] should be able to specify excluded glob as well

https://doc.rust-lang.org/cargo/
cargo install vl-convert

example search config

```
{
  "searches": [
    {
      "name": "object-type",
      "glob": "**/*.ts",
      "searchString": "ObjectType",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },
    {
      "name": "nothing-dto ",
      "glob": "**/*.ts",
      "searchString": "NothingDTO",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },

    {
      "name": "mutations",
      "glob": "**/*.ts",
      "searchString": "@Mutation",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },
    {
      "name": "entities",
      "glob": "**/*.entity.ts"
    }
  ],
  "charts": [
    {
      "name": "all",
      "type": "matrix",
      "searches": ["*"]
    },
    {
      "name": "object-type-vs-mutations",
      "type": "line",
      "searches": ["object-type", "mutations"]
    }
  ]
}

```
