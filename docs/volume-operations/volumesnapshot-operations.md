---
id: volume-snapshot-operations
title: VolumeSnapshot Operations
sidebar_label: VolumeSnapshot Operations
---

## VolumeSnapshot Operations

### Creating Snapshot Class
Each volume snapshot is bound to a SnapshotClass that describes the class and type of snapshots when provisioning a volume snapshot. A SnapshotClass in IOMesh, in other words, is equivalent to a storage policy that allows you specify `provisioner` and `deletionpolicy`.  `deletionpolicy` means whether you want to delete IOMesh volumes.

#### Viewing Default SnapshotClass
需要补充【查看默认 SnapshotClass 】的内容，参考【查看默认 StorageClass】


#### Creating SnapshotClass


kubertes snapshot objects are deleted 
k8s 的快照对象删除了， 对应的 ZBS 快照是否要删除
快照创建完成后，如何确保数据一致性



需要写具体的步骤么

In this example, 

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
driver: com.iomesh.csi-driver  # <-- driver.name in iomesh-values.yaml
deletionPolicy: Retain
```

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

Restoring a PV snapshot means creating a PVC while specifying the `dataSource` field referencing to the target snapshot.

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