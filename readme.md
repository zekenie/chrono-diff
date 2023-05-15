- [x] ability to have a vscode-like interface for project search
- [ ] clone repo and collect latest commit of each day
- [ ] we might want to count files that match a grep and not search in them at all
  - [ ] we might want to count LOC of files that match glob and not just those files
- vis
  - table where dates are columns and rows are search tools
- [ ] another API to get from vs code would be their find references

https://doc.rust-lang.org/cargo/
cargo install vl-convert

example search config

```
{
  "searches": [
    {
      "name": "object-type",
      "rootDir": "**/*.ts",
      "searchString": "ObjectType",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },
    {
      "name": "nothing-dto ",
      "rootDir": "**/*.ts",
      "searchString": "NothingDTO",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },

    {
      "name": "mutations",
      "rootDir": "**/*.ts",
      "searchString": "@Mutation",
      "options": {
        "wholeWord": true,
        "caseSensitive": true
      }
    },
    {
      "name": "entities",
      "rootDir": "**/*.entity.ts"
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
