---
id: create-snapshotclass
title: Creating VolumeSnapshotClass
sidebar_label: Creating VolumeSnapshotClass
---

A VolumeSnapshot is a snapshot of an existing PV on the storage system, and each VolumeSnapshot is bound to a SnapshotClass that describes the class of snapshots when provisioning a VolumeSnapshot. Just like `iomesh-csi-driver` as a default StorageClass, a default SnapshotClass will be created at the same time when IOMesh is installed and cannot be modified. You can also create new SnapshotClasses with customized parameters.


|Parameter|Description|Default (`iomesh-csi-driver`)|
|---|---|---|
|`driver`| The driver that determines what CSI volume plugin is used for provisioning VolumeSnapshots. |`com.iomesh.csi-driver`|
|[`deletionPolicy`](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/)|Allows you to configure what happens to the VolumeSnapshotContent when the VolumeSnapshot object is to be deleted, either be `Retain` or `Delete`.|`Delete`|

**Procedure**

1. Create a YAML config `sc.yaml` and configure the fields `driver` and `deletionPolicy`.

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshotClass
    metadata:
      name: snapshotclass_name
    driver: com.iomesh.csi-driver  # Specify the driver, which defaults to the driver in iomesh.yaml.
    deletionPolicy: Delete # Specify the deletion policy.
    ```

2. Apply the YAML config to create the VolumeSnapshotClass.
  
    ```
    kubectl apply -f sc.yaml 
    ```

3. Get the VolumeSnapshotClass.

    ```
    kubectl get volumesnapshotclass <snapshotclass_name>
    ```

   After running the command, you should see an example like:
    ```output
    NAME                       DRIVER                  DELETIONPOLICY   AGE
    <snapshotclass_name>       com.smartx.csi-driver   Delete           24s
    ```

