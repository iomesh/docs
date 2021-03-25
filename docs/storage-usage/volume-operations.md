---
id: volume-operations
title: Volume Operations
sidebar_label: Volume Operations
---

## Volume Expansion

IOMesh storage  allows volume expansion after creation, no matter whether the PVC is being used or not.

Here is an example. Assume that there is a PVC named example-pvc which capacity is 10Gi:

```yaml
# cat example-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

```bash
# kubectl get pvc example-pvc
NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS             AGE
example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            zbs-csi-driver-default   11m
```

To expand this VPC to 20Gi, just modify the PVC declaration:

```yaml
# cat example-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi # expand to 20Gi
```

And then apply to kubernetes:

```bash
kubectl apply -f example-pvc.yaml
```

Then check the result:

```bash
# kubectl get pvc example-pvc
NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS             AGE
example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi        RWO            zbs-csi-driver-default   11m
# kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca
NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   zbs-csi-driver-default
```



## Volume Snapshot & Restore

IOMesh provides the ability to create a snapshot of a persistent volume. Snapshots can be used to capture the state of a PVC at a given point of time

### VolumeSnapshot

A VolumeSnapshot defines a request to take a snapshot of the PVC. For example:

```yaml
# example-snapshot.yaml
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

The VolumeSnapshot object will be created, and IOMesh will create the VolumeSnapshotContent corresponding to the VolumeSnapshot. The VolumeSnapshotContent represents the entity of the VolumeSnapshot. The relationship between VolumeSnapshot and VolumeSnapshotContent is similar to PVC and PV.

```bash
# kubectl get Volumesnapshots example-snapshot
NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
```

### Restore

User can restore volume snapshots by creating a PVC which dataSource field reference to the snapshots

```yaml
# restore.yaml
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

Apply the YAML file:

```bash
kubectl apply -f example-restore.yaml
```



## Cloning

A Clone is defined as a copy of an existing Kubernetes Volume, users can clone a volume by create a PVC while adding a dataSource that linked to an existing PVC in the same namespace:

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
