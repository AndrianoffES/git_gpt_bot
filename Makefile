build:
	docker build -t  bothelper .
run:
	docker run -d -p 3000:3000 --name  bothelper --rm  bothelper