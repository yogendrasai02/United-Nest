# Coding Conventions

- Import Modules in this order: **Core modules, from NPM, our own modules**. Import modules only at the **starting** in the file.

- Use **Camel Casing** for all variables.

- Use a **space** in between 2 operands, symbols, etc. (ex: `let sum = a + b;`)

- Prefix a **space** before '{' in code blocks.

- If needed, use **comments**. For single line comments describing a code section, use them like: `// ** content goes here **`

- For strings, prefer using **single quotes**.

- Use a **TAB** space for indentation.

- End statements with a **semicolon** ';'

- Do not make a single line occupy lot of width of the row.

- For environment variables (in config.env), use **MACRO_CASE** (ex: `API_SECRET_KEY`)

- Use **JSend** formatting while sending response. [Reference for JSend](https://github.com/omniti-labs/jsend/blob/master/README.md)

- Chain response as `res.status(<STATUS_CODE>).json({ ... })`.

- Before adding an endpoint (route), write the **API Contract** in `api-contract.yml` for that endpoint.

- Incase you find a request object or response object common (**repeated**) in the API Contract, please add a new **Schema** object for that repeated object, and use **references** to that Schema object instead.