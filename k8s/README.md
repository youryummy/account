## Environment
Needed values:
* global.node_env (default: production)
* mongo_host
* mongo_port
* mongo_dbname
* cookie_domain

Optional values:
* global.namespaceOverride - Override the default namespace

## Setup development environment with HELM
1.- Prerequisites
* A kubernetes cluster
* Helm

2.- Create a values.yaml file containing:
```yaml
    global:
        node_env: development
        jwt_secret: mysecret 
        jwt_issuer: myissuer

    account-service:
        mongo_host: host.docker.internal # Assuming the k8s is the one provided by Docker-Desktop
        mongo_port: 27017
        mongo_dbname: test-db
        cookie_domain: localhost
```

3.- Create the namespace
```sh
kubectl create namespace <namespace>
```

4.- Install the chart
```sh
helm install -f values.yaml youryummy ./accounts-service/k8s/
```