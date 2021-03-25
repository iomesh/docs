---
id: iomesh-for-mongodb
title: IOMesh for MongoDB
sidebar_label: IOMesh for MongoDB
---

## Setup k8s Cluster Storage

1. Create a file named `iomesh-mongodb-sc.yaml`, with the following content:

```yaml
# iomesh-mongodb-sc.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: iomesh-mongodb-sc
provisioner: com.iomesh.csi-driver # driver.name in values.yaml when install IOMesh
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  replicaFactor: "2"
  thinProvision: "true"
```

2. Apply the yaml config:

```bash
kubectl apply -f iomesh-mongodb-sc.yaml
```

## Deploy MongoDB

### Create a headless Service for MongoDB

1. Create a Service used for DNS lookups between MongoDB Pods and clients within your cluster

```yaml
# mongodb-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mongo
  labels:
    name: mongo
spec:
  ports:
    - port: 27017
      targetPort: 27017
  clusterIP: None
  selector:
    role: mongo
```

2. Apply the yaml config:

```bash
kubectl apply -f mongodb-service.yaml
```

### Create MongoDB cluster use pv provided for IOMesh Storage

1. Using a statefulset to create a MongoDB cluster

```yaml
# mongodb-statefulset.yaml
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: mongo
spec:
  selector:
    matchLabels:
      role: mongo
      environment: test
  serviceName: "mongo"
  replicas: 3
  template:
    metadata:
      labels:
        role: mongo
        environment: test
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: mongo
        image: mongo
        command:
          - mongod
          - "--replSet"
          - rs0
          - "--smallfiles"
          - "--noprealloc"
        ports:
          - containerPort: 27017
        volumeMounts:
          - name: mongo-persistent-storage
            mountPath: /data/db
      - name: mongo-sidecar
        image: cvallance/mongo-k8s-sidecar
        env:
          - name: MONGO_SIDECAR_POD_LABELS
            value: "role=mongo,environment=test"
  volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: iomesh-mongodb-sc # storageClass created above
      resources:
        requests:
          storage: 10Gi
```

2. Apply the yaml config:

```bash
kubectl apply -f mongodb-statefulset.yaml
```

IOMesh Storage will create Persistent Volumes for each MongoDB pod，whose file system is ext4, replica factor is 2 and thin provisioned.

## Operate MongoDB Data

User can use the feature provided by IOMesh storage to perform operations such as expansion/snapshot/rollback/clone of the Persistent Volumes  where MongoDB data is located, see reference for details [application-operations](http://iomesh.com/docs/storage-usage/application-operations)
