# Step 1: Use an official Node.js image as the base
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install production dependencies
RUN npm install --production

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Expose the port that the app will run on
EXPOSE 3000

# Step 7: Start the app
CMD ["npm", "start"]
