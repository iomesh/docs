---
id: iomesh-for-mysql
title: IOMesh for MySQL
sidebar_label: IOMesh for MySQL
---

IOMesh provides persistent storage for stateful applications like Cassandra, MySQL, and MongDB. The following section describes how to deploy these stateful applications using IOMesh. 需要一段话简述 IOMesh 和 Stateful Application 的关系。

**Prerequisite**

Verify that your IOMesh cluster is already deployed. 

**Procedure**
1. Create the StorageClass `iomesh-mysql-sc.yaml`. You can directly use the default StorageClass or create one with custom parameters. Refer to [Creating StorageClass](../volume-operations/create-storageclass.md#creating-storageclass) for detailed information.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-mysql-sc
    provisioner: com.iomesh.csi-driver # The driver.name in `values.yaml` when deploying IOMesh cluster.
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
    ```

2. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f iomesh-mysql-sc.yaml
    ```
3. Create a YAML file named `mysql-deployment.yaml` that contains `PersistentVolumeClaim`, `Service`, and `Deployment`.
    ```yaml
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
              # Enter a password to allow access to the database.
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
              claimName: iomesh-mysql-pvc 
    ```

4. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f mysql-deployment.yaml
    ```

    Once done, persistent volumes will be created by IOMesh for each MySQL pod, and each persistent volume will have configurations such as filesystem type and replication factor as configured in the StorageClass.

    You can expand, snapshot, or clone persistent volumes where MySQL data are located. For details, refer to [Volume Operations] and [VolumeSnapshot Operations].