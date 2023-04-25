---
id: iomesh-for-mongodb
title: IOMesh for MongoDB
sidebar_label: IOMesh for MongoDB
---


**Prerequisite**

Verify the IOMesh cluster is already deployed.

**Procedure**

> _NOTE:_ The following example does not apply to a `AArch64` Kubernetes cluster.

1. Create a YAML config `iomesh-mongodb-sc.yaml` with the following content.  You may also use the default StorageClass `iomesh-csi-driver`. See more details in [Create StorageClass](../volume-operations/create-storageclass).

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-mongodb-sc
    provisioner: com.iomesh.csi-driver # The driver name in `iomesh.yaml`.
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
    ```

2. Apply the YAML config to create the StorageClass. 

    ```bash
    kubectl apply -f iomesh-mongodb-sc.yaml
    ```

3. Create a YAML config `mongodb-service.yaml` with the following content. This file defines the headless service, which is used for DNS lookups between MongoDB pods and clients within your cluster

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

4. Apply the YAML config to create the headless service.

    ```bash
    kubectl apply -f mongodb-service.yaml
    ```

5. Create a StatefulSet `mongodb-statefulset.yaml` with the following content. In the field `storageClassName`, type the StorageClass you specify in Step 1.

    ```yaml
    apiVersion: apps/v1
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
            ports:
              - containerPort: 27017
            volumeMounts:
              - name: mongodb-data
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
          storageClassName: iomesh-mongodb-sc # The StorageClass in Step 1.
          resources:
            requests:
              storage: 10Gi
    ```

6. Apply the YAML config to deploy MongoDB.

    ```bash
    kubectl apply -f mongodb-statefulset.yaml
    ```

    Persistent volumes will be created by IOMesh for each MongoDB pod, and each persistent volume will have configurations such as the filesystem type and replication factor as specified in the StorageClass.

    Once done, you can expand, snapshot, or clone persistent volumes where MongoDB data are located. For details, refer to [Volume Operations](../volume-operations/expand-pv) and [VolumeSnapshot Operations](../volumesnapshot-operations/restore-volumesnapshot).
