---
id: iomesh-for-mongodb
title: IOMesh for MongoDB
sidebar_label: IOMesh for MongoDB
---


**Prerequisite**

Verify the IOMesh cluster is already deployed.

**Procedure**

1. Create a StorageClass named `iomesh-mongodb-sc.yaml` with the following parameters.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-mongodb-sc
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
    ```

2. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f iomesh-mongodb-sc.yaml
    ```

3. Create a headless service which is used for DNS lookups between MongoDB Pods and the clients within your cluster.

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

4. Running the command to apply the YAML file.

    ```bash
    kubectl apply -f mongodb-service.yaml
    ```
5. Create a StatefulSet for MongoDB. In the field `storageClassName`, type the StorageClass you choose in Step 1.

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
          storageClassName: iomesh-mongodb-sc # The StorageClass in Step 1.
          resources:
            requests:
              storage: 10Gi
    ```

6. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f mongodb-statefulset.yaml
    ```

Persistent volumes will be created by IOMesh for each MongoDB pod, and each persistent volume will have configurations such as filetype and replication factor as configured in the StorageClass.

Once done, you can expand, snapshot, or clone persistent volumes where MySQL data are located. For details, refer to [Volume Operations] and [VolumeSnapshot Operations].
