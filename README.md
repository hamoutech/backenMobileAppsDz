# soccer-backoffice-back

# déploiment vers contabo

# step 1

docker build -t image_1:latest .

# step 2

docker save -o image_1.tar image_1:latest

# step 3

scp image_1.tar root@161.97.80.158:~/

# step 4

connect in contabo :

ssh root@161.97.80.158

# step 5

docker load < image_1.tar

# step 6

docker run -d -p 4000:4000 --restart always image_1:latest
