---
id: create-snapshotclass
title: Creating SnapshotClass
sidebar_label: Creating SnapshotClass
---

A VolumeSnapshot is a snapshot of an existing PV on the storage system, and each VolumeSnapshot is bound to a SnapshotClass that describes the class of snapshots when provisioning a VolumeSnapshot.

A SnapshotClass in IOMesh is equivalent to a storage policy that specifies parameters like `driver` and `deletionpolicy` to use when taking a snapshot. Just like `iomesh-csi-driver` as a default StorageClass, a default SnapshotClass will be created at the same time when IOMesh is installed and cannot be modified. You can also create new SnapshotClasses with customized parameters.


|Parameter|Available Value| Default Value| Description|
|---|---|---|---|
|`driver`| / |com.iomesh.csi-driver| The provisioner, which defaults to `com.iomesh.csi-driver`|
|`deletionPolicy`|"Retain" or "Delete"| Retain| Shows if you want to delete IOMesh volumes 可以链到 Kubernetes 具体文档|


**Procedure**
1. Create a YAML file and specify the field `driver`. 

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshotClass
    metadata:
      name: iomesh-csi-driver-default 
    driver: com.iomesh.csi-driver  # 是否可以指定，The driver name in iomesh.yaml during manual installation.
    deletionPolicy: Retain # Whether you want to delete IOMesh volumes.
    ```

2. Run the following command to apply the YAML file.
  
    ```
    kubectl apply -f sc.yaml # 这里的命令直接 copy 的存储类，需要检查一下 yaml 文件名是否正确
    ```

3. Run the following command to check the snapshot class.

    ```
    kubectl 增加一个查看的命令？
    ```
