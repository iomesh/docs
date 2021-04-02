---
id: version-0.9.4-iomesh-for-mysql
title: IOMesh for MySQL
sidebar_label: IOMesh for MySQL
original_id: iomesh-for-mysql
---

## Setup k8s Cluster Storage

1. Create a file named `iomesh-mysql-sc.yaml` with the following content:

```text
iomesh-mysql-sc.yaml
```

```output
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: iomesh-mysql-sc
provisioner: com.iomesh.csi-driver # driver.name in values.yaml when install IOMesh cluster
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  replicaFactor: "2"
  thinProvision: "true"
```

2. Apply the yaml config:

```bash
kubectl apply -f iomesh-mysql-sc.yaml
```

## Deploy MySQL

1. Create a file named `mysql-deployment.yaml`. It describes a Deployment that runs MySQL and creates a PVC that consumes the IOMesh storage.

```text
mysql-deployment.yaml
```

```output
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: iomesh-mysql-pvc
spec:
  storageClassName: iomesh-mysql-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  ports:
  - port: 3306
  selector:
    app: mysql
  clusterIP: None
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - image: mysql:5.6
        name: mysql
        env:
          # Use secret in real usage
        - name: MYSQL_ROOT_PASSWORD
          value: password
        ports:
        - containerPort: 3306
          name: mysql
        volumeMounts:
        - name: mysql-persistent-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-persistent-storage
        persistentVolumeClaim:
          claimName: iomesh-mysql-pvc # pvc from iomesh created above
```

2. Apply the yaml config:

```bash
kubectl apply -f mysql-deployment.yaml
```

## Operate MySQL Data

User can use the feature provided by IOMesh storage to perform operations such as expansion/snapshot/rollback/clone of the pv  where MySQL data is located, see reference for details [application-operations](http://iomesh.com/docs/storage-usage/application-operations)
