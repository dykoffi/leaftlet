FROM dykoffi/node-serve:light as release

WORKDIR /app
COPY dist ./
COPY config-schema.json ./
COPY logo.png ./

EXPOSE 8000

CMD serve -sp 8000