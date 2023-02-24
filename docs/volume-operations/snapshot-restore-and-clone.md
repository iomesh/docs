---
id: snapshot-restore-and-clone
title: Snapshot, Restore and Clone
sidebar_label: Snapshot, Restore and Clone
---

## Snapshot, RollBack, and Clone

### Creating PV Snapshot

You can take a snapshot for an existing PV using IOMesh. A VolumeSnapshot object defines a request for creating a snapshot for a PVC.



A VolumeSnapshot allows you to specify different attributes belonging to a `volumesnapshot`. These attributes may differ among snapshots taken from the same volume on the storage system and therefore cannot be expressed by using the same StorageClass of a PVC.






Each VolumeSnapshot contains a spec and a status. `persistentVolumeClaimName` refers to the name of the PVC for the snapshot and is required for dynamically provisioning a snapshot.

A volume snapshot can request a particular class by specifying the name of a VolumeSnapshotClass using the attribute volumeSnapshotClassName. If nothing is set, then the default class is used if available.

创建的是 Snapshot

1. Create and configure the YAML file.

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshot
    metadata:
      name: example-snapshot
    spec:
      volumeSnapshotClassName: iomesh-csi-driver-default
      source:
        persistentVolumeClaimName: mongodb-data-pvc # PVC name that want to take snapshot
    ```

2. Run the following command to apply the YAML file. 会生成一个 volumesnapshot object ？

    ```text
    kubectl apply -f example-snapshot.yaml
    ```

3. After the VolumeSnapshot object is created, a corresponding VolumeSnapshotContent object will be created by IOMesh.

    ```bash
    kubectl get Volumesnapshots example-snapshot
    ```

  After running the command, you should see an example below:
```output
NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
```

### Restoring VolumeSnapshot

Restoring a PV snapshot means creating a PVC with specifying `dataSource` referencing to the target snapshot.

通过创建 PVC 来恢复一个 volumesnapshot

You can restore a PV snapshot by creating a PVC with specifying the `dataSource` field referencing to the target snapshot.

**Procedure**

1. Create and configure the YAML file.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-restore
    spec:
      storageClassName: iomesh-csi-driver-default
      dataSource:
        name: example-snapshot
        kind: VolumeSnapshot
        apiGroup: snapshot.storage.k8s.io
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 6Gi
    ```

2. Run the following command to apply the YAML file. Replace `example-restore.yaml` with the YAML file name.

    ```bash
    kubectl apply -f example-restore.yaml
    ```

### Volume Cloning
A clone is a duplicate of an existing volume on the system; data on the source is duplicated to the destination. To clone a PVC, you should specify an existing PVC in the `dataSource` field so that the user can clone a volume based on it.

Before cloning a PVC, be aware of the following:
- The source PVC and the destination PVC must be in the same namespace.
- The source PVC and the destination PVC must have the same StorageClass and VolumeMode configurations.

通过创建 PVC 来克隆一个 volume



**Procedure**
1. Create and configure the YAML file.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cloned-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: existing-pvc # The source PVC in the same namespace. 
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi # The capacity value must be the same or larger than that of the source volume.
  volumeMode: Block
```

2. Run the following command to apply the YAML file.

   ```bash
   kubectl apply -f example-clone.yaml
   ```
   Once done, a clone of `existing-pvc` will be created.

