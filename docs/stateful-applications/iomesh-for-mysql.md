---
id: iomesh-for-mysql
title: IOMesh for MySQL
sidebar_label: IOMesh for MySQL
---

有状态应用和 IOMesh 之间的关系

IOMesh 通过 PV 为有状态


This tutorial assumes that your cluster is configured to dynamically provision PersistentVolumes. If your cluster is not configured to do so, you will have to manually provision two 1 GiB volumes prior to starting this tutorial. (这一步已经在 IOMesh 做了)

## Configure Kubernetes Cluster Storage (这一步和 mysql 有啥关系)

MySQL 需要 PVC，创建 PVC 需要 storageclass (动态置备，PVC 会根据 storageclass 自动创建 PV)

1. Create a YAML file named `iomesh-mysql-sc.yaml`, which is a StorageClass, and refer to the following example to configure it. 自定义的

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

## Deploying MySQL

1. Create a YAML file named `mysql-deployment.yaml`. (It describes a Deployment that runs MySQL and creates a PVC that consumes the IOMesh storage. 啥意思）

deployment 用来管理多个 pod

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-mysql-pvc # 通过这个文件创建的 PVC
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
              # Use secret in real usage 啥啥啥意思？ Enter the password
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
              claimName: iomesh-mysql-pvc # pvc from iomesh created above 啥啥啥啥意思
    ```

2. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f mysql-deployment.yaml
    ```

## Operating MySQL Data

You can expand, snapshot, or clone persistent volumes where MySQL data are located. For details, refer to [application-operations](https://docs.iomesh.com/volume-operations/snapshot-restore-and-clone)