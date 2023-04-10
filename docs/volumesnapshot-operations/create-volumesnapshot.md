---
id: create-volumesnapshot
title: VolumeSnapshot Operations
sidebar_label: VolumeSnapshot Operations
---

## Create VolumeSnapshot

A VolumeSnapshot is a request for snapshot of a volume and similar to a PVC, while a VolumeSnapshotContent is the snapshot taken from a volume provisioned in the cluster. 

**Prerequisite**

Ensure that there is already a SnapshotClass.

**Procedure**

1. Create the YAML file `snapshot.yaml`. Specify the SnapshotClass and PVC.

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshot
    metadata:
      name: example-snapshot
    spec:
      volumeSnapshotClassName: iomesh-csi-driver # Specify a SnapshotClass such as `iomesh-csi-driver`.
      source:
        persistentVolumeClaimName: mongodb-data-pvc # Specify the PVC for which you want to take a snapshot such as `mongodb-data-pvc`.
    ```

2. Run the following command to apply the YAML file. A VolumeSnapshot will be created.

    ```bash
    kubectl apply -f snapshot.yaml
    ```

3. Once the VolumeSnapshot is created, the corresponding VolumeSnapshotContent will be created at the same time by IOMesh. Verify that they were both created by running the following command.

    ```bash
    kubectl get Volumesnapshots example-snapshot
    ```

    After running the command, you should see an example like:

    ```output
    NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
    example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
    ```
## Restore Volume from VolumeSnapshot

Restoring a VolumeSnapshot means creating a PVC while specifying the `dataSource` field referencing to the target snapshot. 

**Precaution**

The storage capacity value in the new PV should be the same as that of the source PV.

**Procedure**

1. Create a YAML config `restore.yaml`. 

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-restore 
    spec:
      storageClassName: iomesh-csi-driver 
      dataSource:
        name: example-snapshot # Specify the target VolumeSnapshot.
        kind: VolumeSnapshot
        apiGroup: snapshot.storage.k8s.io
      accessModes:
        - ReadWriteOnce # Must be same as the access mode in the VolumeSnapshot.
      resources:
        requests:
          storage: 6Gi # Must be same as the storage value in the VolumeSnapshot.
    ```

2. Apply the YAML config to create the PVC.

    ```bash
    kubectl apply -f restore.yaml
    ```
3. Check the PVC. A PV will be created and bounded to this PVC.

    ```
    kubectl get pvc example-restore
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    example-restore                             Bound    pvc-54230f3f-47dc-46e8-8c42-38c073c40598   6Gi        RWO            iomesh-csi-driver   21h   
    ```
