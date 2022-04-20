---
id: version-0.11.0-iomesh-for-mongodb
title: IOMesh for MongoDB
sidebar_label: IOMesh for MongoDB
original_id: iomesh-for-mongodb
---

## Setup k8s Cluster Storage

1. Create a file named `iomesh-mongodb-sc.yaml` with the following contents:

    ```yaml
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

1. Create a Service used for DNS lookups between MongoDB Pods and the clients within your cluster

    ```yaml
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

### Create MongoDB cluster using pv provided for IOMesh Storage

1. Use StatefulSet to create a MongoDB cluster

    ```yaml
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

IOMesh Storage will create Persistent Volumes for each MongoDB pod. These volumes use ext4 file system with a replica factor of 2 and thin provision.

## Operate MongoDB Data

Users can use the features provided by IOMesh storage to perform such operations as expansion/snapshot/rollback/clone of the Persistent Volumes where MongoDB data are located, see the reference for details [application-operations](https://docs.iomesh.com/volume-operations/snapshot-restore-and-clone)