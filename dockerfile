FROM dykoffi/node-serve:light as release

WORKDIR /app
COPY dist ./
COPY logo.png ./
COPY config-schema.json ./

EXPOSE 8000

CMD serve --cors -sp 8000