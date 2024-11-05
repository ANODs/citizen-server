# Используем официальный образ Node.js
FROM node:16

# Создаем директорию приложения
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Создаем пользователя node_user
RUN useradd -m node_user
USER node_user

# Открываем порт, который будет использовать приложение
EXPOSE 3000

# Запускаем приложение
CMD [ "node", "server.js" ]