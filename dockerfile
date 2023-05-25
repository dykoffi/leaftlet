FROM dykoffi/node-serve:light as release

WORKDIR /app
COPY dist ./
COPY logo.png ./
COPY wasm_exec.js ./
COPY config-schema.json ./
COPY main.wasm ./

EXPOSE 8000

CMD serve --cors -sp 8000