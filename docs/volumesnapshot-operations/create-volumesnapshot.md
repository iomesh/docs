---
id: create-volumesnapshot
title: Creating VolumeSnapshot
sidebar_label: Creating VolumeSnapshot
---


A VolumeSnapshot is a request for snapshot of a volume and similar to a PVC, while a VolumeSnapshotContent is the snapshot taken from a volume provisioned in the cluster. 

**Prerequisite**

Ensure that there is already a SnapshotClass.

**Procedure**

1. Create the YAML file. Specify the SnapshotClass and PVC.

    ```yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshot
    metadata:
      name: example-snapshot
    spec:
      volumeSnapshotClassName: iomesh-csi-driver-default # Specify the SnapshotClass.
      source:
        persistentVolumeClaimName: mongodb-data-pvc # Specify the PVC for which you want to take a snapshot.
    ```

2. Run the following command to apply the YAML file. A VolumeSnapshot will be created.

    ```text
    kubectl apply -f example-snapshot.yaml
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