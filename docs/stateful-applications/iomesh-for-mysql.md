---
id: iomesh-for-mysql
title: IOMesh for MySQL
sidebar_label: IOMesh for MySQL
---


**Prerequisite**

Verify that your IOMesh cluster is already deployed. 

**Procedure**
1. Create a YAML config `iomesh-mysql-sc.yaml` with the following content. You may also use the default StorageClass `iomesh-csi-driver`. See more details in [Create StorageClass](../volume-operations/create-storageclass.md).

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-mysql-sc
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
    kubectl apply -f iomesh-mysql-sc.yaml
    ```
3. Create a YAML config `mysql-deployment.yaml` with the following content,  containing `PersistentVolumeClaim`, `Service`, and `Deployment`.
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

    For more information, refer to [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and [Service](https://kubernetes.io/docs/concepts/services-networking/service/).

4. Apply the YAML config to deploy MySQL.

    ```bash
    kubectl apply -f mysql-deployment.yaml
    ```

    Once done, persistent volumes will be created by IOMesh for each MySQL pod, and each persistent volume will have configurations such as filesystem type and replication factor as specified in the StorageClass.

    You can expand, snapshot, or clone persistent volumes where MySQL data are located. For details, refer to [Volume Operations](../volume-operations/expand-pv.md) and [VolumeSnapshot Operations](../volumesnapshot-operations/restore-volumesnapshot.md).