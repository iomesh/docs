---
id: create-snapshotclass
title: Create VolumeSnapshotClass
sidebar_label: Create VolumeSnapshotClass
---

A VolumeSnapshot is a snapshot of an existing PV on the storage system, and each VolumeSnapshot is bound to a SnapshotClass that describes the class of snapshots when provisioning a VolumeSnapshot. 

To create a VolumeSnaphotClass, refer to the following:

|Field|Description|Value|
|---|---|---|
|`driver`|The driver that determines what CSI volume plugin is used for provisioning VolumeSnapshots.|`com.iomesh.csi-driver`|
|[`deletionPolicy`](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/#deletionpolicy)|Allows you to configure what happens to the VolumeSnapshotContent when the VolumeSnapshot object is to be deleted.| `Delete`|

**Procedure**

1. Create a YAML config `snc.yaml` and configure the fields `driver` and `deletionPolicy`.

    ```yaml
    # Source: snc.yaml
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshotClass
    metadata:
      name: iomesh-csi-driver
    driver: com.iomesh.csi-driver  # The driver in iomesh.yaml.
    deletionPolicy: Delete # "Delete" is recommended.
    ```

2. Apply the YAML config to create the VolumeSnapshotClass.
  
    ```
    kubectl apply -f snc.yaml 
    ```

3. Get the VolumeSnapshotClass.

    ```
    kubectl get volumesnapshotclass iomesh-csi-driver
    ```

   If successful, you should see output like this:
    ```output
    NAME                             DRIVER                  DELETIONPOLICY   AGE
    iomesh-csi-driver                com.iomesh.csi-driver   Delete           24s
    ```

