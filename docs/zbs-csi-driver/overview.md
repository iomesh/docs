---
id: overview
title: ZBS CSI Driver Overview
sidebar_label: Overview
---

The ZBS Container Storage Interface (CSI) Driver provides a [CSI](https://github.com/container-storage-interface/spec/blob/master/spec.md) interface implementation used by Container Orchestrators to manage the lifecycle of ZBS volumes.

## Features

- **[Raw Block Volume][1]** - This CSI feature (`CSIBlockVolume`) is GA since Kubernetes 1.18.
- **[Volume Snapshot][2]** - create volume snapshots or restore the volume from a snapshot.
  The corresponding CSI feature (`VolumeSnapshotDataSource`) is beta since Kubernetes 1.17.
- **[Volume Cloning][3]** - clone a exist volume. This CSI feature (`VolumeContentSourceVolume`) is GA since Kubernetes 1.18.
- **[Volume Expansion][4]** - expand volume. This CSI feature (`ExpandCSIVolumes`) is beta since Kubernetes 1.16.

[1]: https://kubernetes-csi.github.io/docs/raw-block.html "Kubernetes CSI - Raw Block Volume Feature"
[2]: https://kubernetes-csi.github.io/docs/snapshot-restore-feature.html "Kubernetes CSI - Snapshot & Restore Feature"
[3]: https://kubernetes-csi.github.io/docs/volume-cloning.html "Kubernetes CSI - Volume Cloning"
[4]: https://kubernetes-csi.github.io/docs/volume-expansion.html "Kubernetes CSI - Volume Expansion"



### Access Mode

We support Mount Volume (Filesystem Volume) and Block Volume. Their supported access modes are as follows.

| Access Mode \ Volume Mode | Mount Volume | Block Volume |
| ------------------------- | ------------ | ------------ |
| SINGLE_NODE_READER_ONLY   | yes          | yes          |
| SINGLE_NODE_WRITER        | yes          | yes          |
| MULTI_NODE_MULTI_WRITER   | no           | yes          |
| MULTI_NODE_READER_ONLY    | no           | yes          |
| MULTI_NODE_SINGLE_WRITER  | no           | yes          |



### StorageClass Parameters

StorageClass have parameters that describe volumes belonging to the StorageClass.
| Parameters                | Values                        | Default | Description                       |
| ------------------------- | ----------------------------- | ------- | --------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type           |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                    |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision |

```yaml
# Declare StorageClass with parameters
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: example-sc
# zbs-csi-driver name
provisioner: zbs-csi-driver.iomesh.com
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  replicaFactor: "1"
  thinProvision: "true"
reclaimPolicy: Retain
allowVolumeExpansion: true
volumeBindingMode: Immediate
---
# Declare pvc with StorageClass example-sc.
# Then get a file system of ext4, single replica, thin provisioned volume.
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: example-sc
```

> **_Note:_ These parameters will be passed to  `CreateVolumeRequest.parameters` map**



## Kubernetes Version Compatibility Matrix

| ZBS CSI Driver \ Kubernetes Version                                                                                                                              | v1.17 | v1.18 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| [v0.1.1](https://hub.docker.com/layers/iomesh/zbs-csi-driver/v0.1.1/images/sha256-a5ec4be9c37d96a4602a8f028e9b0c96867083c4c2386d29e49e7fe0a9c294c1?context=repo) | yes   | yes   |
