---
id: snapshot-and-clone
title: Snapshot And Clone
sidebar_label: Snapshot And Clone
---

## Snapshot

IOMesh provides the ability to create a snapshot of a existing persistent volume.

A VolumeSnapshot object defines a request of taking a snapshot of the PVC.

For example:

```text
example-snapshot.yaml
```

```output
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: example-snapshot
spec:
  volumeSnapshotClassName: iomesh-csi-driver-default
  source:
    persistentVolumeClaimName: mongodb-data-pvc # user wants to snapshot the mongodb-data-pvc PVC
```

Apply the YAML file:

```text
kubectl apply -f example-snapshot.yaml
```

The VolumeSnapshot object will be created, and IOMesh will create the VolumeSnapshotContent corresponding to the VolumeSnapshot. The VolumeSnapshotContent represents the entity of the VolumeSnapshot.

```bash
kubectl get Volumesnapshots example-snapshot
```

```output
NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
```

## Restore

User can restore volume snapshots by creating a PVC which dataSource field reference to the snapshots.

For example:

```text
restore.yaml
```

```output
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-restore
clonespec:
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

Apply the YAML file:

```bash
kubectl apply -f example-restore.yaml
```

## Clone

Users can clone a volume by create a PVC while adding a dataSource that linked to an existing PVC in the same namespace.

For example:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cloned-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: existing-pvc # an existing PVC in the same namespace
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  volumeMode: Block
```

The result is a new PVC with the name `cloned-pvc` that has the exact same content as the specified source `existed-pvc`.

Users need to be aware of the following when using this feature:

1. You can only clone a PVC when it exists in the same namespace as the destination PVC (source and destination must be in the same namespace).
2. Cloning is only supported within the same Storage Class.
   - Destination volume must be the same storage class as the source
   - Default storage class can be used and storageClassName omitted in the spec
3. Cloning can only be performed between two volumes that use the same VolumeMode setting (if you request a block mode volume, the source MUST also be block mode)
