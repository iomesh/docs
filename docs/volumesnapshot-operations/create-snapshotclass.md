---
id: create-snapshotclass
title: Creating VolumeSnapshotClass
sidebar_label: Creating VolumeSnapshotClass
---

A VolumeSnapshot is a snapshot of an existing PV on the storage system, and each VolumeSnapshot is bound to a SnapshotClass that describes the class of snapshots when provisioning a VolumeSnapshot. Just like `iomesh-csi-driver` as a default StorageClass, a default SnapshotClass will be created at the same time when IOMesh is installed and cannot be modified. You can also create new SnapshotClasses with customized parameters.


|Parameter|Description|Default `iomesh-csi-driver`|
|---|---|---|
|`driver`| The driver that determines what CSI volume plugin is used for provisioning VolumeSnapshots. |`com.iomesh.csi-driver`|
|[`deletionPolicy`](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/)|Allows you to configure what happens to the VolumeSnapshotContent when the VolumeSnapshot object is to be deleted, either be `Retain` or `Delete`.|`Delete`|

**Procedure**

1. Create a YAML file and specify the field `driver` and `deletionPolicy`.(明确字段设置的建议以及默认值，倾向性转为建议)

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshotClass
    metadata:
      name: snapshotclass_name
    driver: com.iomesh.csi-driver  # Defaults to the driver in iomesh.yaml during manual installation. 
    deletionPolicy: Delete # Specify the deletion policy.
    ```

2. Run the following command to apply the YAML file.
  
    ```
    kubectl apply -f sc.yaml # 这里的命令直接 copy 的存储类，需要检查一下 yaml 文件名是否正确
    ```

3. Run the following command to check the snapshot class.

    ```
    kubectl 增加一个查看的命令？
    ```
    加一个 example